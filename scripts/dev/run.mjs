import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import {
  log, fail, checkNode, run, postgres, isInitialised, assertLocalStrapiEnv, pipeWithPrefix, waitFor,
  readEnv, writeEnv, ROOT, STRAPI_DIR, ADMIN_DIR, ADMIN_ENV, CREDENTIALS, STRAPI_URL, ADMIN_URL,
} from './lib.mjs';

const withSite = process.argv.includes('--site');
const SITE_DIR = path.join(ROOT, 'frontend');

checkNode();
if (!isInitialised() || !fs.existsSync(path.join(STRAPI_DIR, 'node_modules')) || !fs.existsSync(path.join(ADMIN_DIR, 'node_modules'))) {
  fail('Run "npm run setup" first.');
}
assertLocalStrapiEnv();

const children = [];
const pg = postgres();
let stopping = false;

async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  log('Stopping...');
  for (const child of children) child.kill('SIGINT');
  await new Promise((r) => setTimeout(r, 1500));
  await pg.stop().catch(() => {});
  process.exit(code);
}
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function start(prefix, cmd, args, cwd, extraEnv = {}) {
  const env = { ...process.env, FORCE_COLOR: '1', ...extraEnv };
  delete env.NO_COLOR;
  const child = spawn(cmd, args, { cwd, env, stdio: 'pipe' });
  pipeWithPrefix(child, prefix);
  child.on('exit', (code) => {
    if (!stopping) {
      log(`${prefix} exited with code ${code}`);
      shutdown(1);
    }
  });
  children.push(child);
  return child;
}

log('Starting local Postgres (port 5433)...');
await pg.start();

log('Starting dev Strapi (http://127.0.0.1:1337)...');
start('\x1b[35m[strapi]\x1b[0m', 'npm', ['run', 'develop', '--', '--no-watch-admin'], STRAPI_DIR);
if (!(await waitFor(`${STRAPI_URL}/_health`))) fail('Strapi did not start in time.');

await ensureStrapiToken();

log(`Starting admin panel (${ADMIN_URL})...`);
start('\x1b[32m[admin]\x1b[0m', 'npx', ['next', 'dev', '-p', '3001'], ADMIN_DIR);
await waitFor(`${ADMIN_URL}/login`);

if (withSite) {
  if (!fs.existsSync(path.join(SITE_DIR, 'node_modules'))) {
    log('Installing website dependencies (first run only)...');
    await run('npx', ['-y', 'yarn@1', 'install', '--frozen-lockfile'], SITE_DIR);
  }
  log('Starting the public website (http://localhost:3000) using dev Strapi...');
  // Explicit env wins over any frontend/.env*, so the local site can never read from or submit forms to production.
  start('\x1b[34m[site]\x1b[0m', 'npx', ['next', 'dev', '-p', '3000'], SITE_DIR, {
    NEXT_PUBLIC_STRAPI_URL: STRAPI_URL,
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  });
  await waitFor('http://localhost:3000');
}

console.log(`
  \x1b[1mCHIC local development is running\x1b[0m
  Admin panel:      ${ADMIN_URL}   (password in .dev/dev-credentials.txt)
  Dev Strapi admin: ${STRAPI_URL}/admin${withSite ? '\n  Website:          http://localhost:3000' : ''}
  Press Ctrl+C to stop everything.
`);

async function tokenWorks(token) {
  const res = await fetch(`${STRAPI_URL}/api/panel/social/entries`, { headers: { Authorization: `Bearer ${token}` } });
  return res.ok;
}

// Creates a dev-only Strapi admin user and a full-access API token for the admin panel.
async function ensureStrapiToken() {
  const env = readEnv(ADMIN_ENV);
  if (env.STRAPI_TOKEN && (await tokenWorks(env.STRAPI_TOKEN))) return;

  log('Creating a dev Strapi API token for the admin panel...');
  const email = 'dev@chic.local';
  const password = `Dev-${crypto.randomBytes(5).toString('hex')}A1`;
  const cli = (args) => run('npx', ['strapi', ...args], STRAPI_DIR, { prefix: '\x1b[35m[strapi-cli]\x1b[0m' });
  try {
    await cli(['admin:create-user', '--firstname=Dev', '--lastname=Local', `--email=${email}`, `--password=${password}`]);
  } catch {
    await cli(['admin:reset-user-password', `--email=${email}`, `--password=${password}`]);
  }

  const login = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());
  const jwt = login?.data?.token;
  if (!jwt) fail(`Could not log in to dev Strapi: ${JSON.stringify(login)}`);

  const created = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ name: `admin-panel-dev-${Date.now()}`, type: 'full-access', lifespan: null, description: 'Local admin panel (dev only)' }),
  }).then((r) => r.json());
  const token = created?.data?.accessKey;
  if (!token) fail(`Could not create API token: ${JSON.stringify(created)}`);

  writeEnv(ADMIN_ENV, { ...readEnv(ADMIN_ENV), STRAPI_TOKEN: token });
  const creds = fs.existsSync(CREDENTIALS) ? fs.readFileSync(CREDENTIALS, 'utf8').replace(/\nDev Strapi admin[\s\S]*$/, '') : '';
  fs.writeFileSync(CREDENTIALS, `${creds.trimEnd()}\nDev Strapi admin (${STRAPI_URL}/admin)\n  email: ${email}\n  password: ${password}\n`, { mode: 0o600 });
}
