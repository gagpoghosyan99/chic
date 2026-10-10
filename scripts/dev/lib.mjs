import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DEV_DIR = path.join(ROOT, '.dev');
export const PG_DIR = path.join(DEV_DIR, 'pgdata');
export const SNAPSHOT = path.join(DEV_DIR, 'snapshot.sql');
export const CREDENTIALS = path.join(DEV_DIR, 'dev-credentials.txt');
export const STRAPI_DIR = path.join(ROOT, 'strapi');
export const ADMIN_DIR = path.join(ROOT, 'admin');
export const STRAPI_ENV = path.join(STRAPI_DIR, '.env');
export const ADMIN_ENV = path.join(ADMIN_DIR, '.env.local');

export const DB = { host: '127.0.0.1', port: 5433, user: 'chic', password: 'chic-dev', name: 'chic_dev' };
export const STRAPI_URL = 'http://127.0.0.1:1337';
export const ADMIN_URL = 'http://localhost:3001';

export const log = (msg) => console.log(`\x1b[36m[chic]\x1b[0m ${msg}`);
export const fail = (msg) => {
  console.error(`\x1b[31m[chic] ${msg}\x1b[0m`);
  process.exit(1);
};

export function checkNode() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20 || major > 24) fail(`Node.js 20–24 is required (you have ${process.versions.node}).`);
}

export function postgres() {
  return new EmbeddedPostgres({
    databaseDir: PG_DIR,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    persistent: true,
    onLog: () => {},
  });
}

export const isInitialised = () => fs.existsSync(path.join(PG_DIR, 'PG_VERSION'));

export async function databaseExists(pg) {
  const client = pg.getPgClient('postgres', DB.host);
  await client.connect();
  const { rowCount } = await client.query('select 1 from pg_database where datname = $1', [DB.name]);
  await client.end();
  return rowCount > 0;
}

export async function loadSnapshot(pg) {
  const sql = fs
    .readFileSync(SNAPSHOT, 'utf8')
    .split('\n')
    .filter((line) => !line.startsWith('\\'))
    .join('\n');
  const client = pg.getPgClient(DB.name, DB.host);
  await client.connect();
  await client.query(sql);
  await client.query(`alter database ${DB.name} set search_path to public`);
  await client.end();
}

export const secret = () => crypto.randomBytes(24).toString('base64');

export function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
}

export function writeEnv(file, values) {
  fs.writeFileSync(file, Object.entries(values).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', { mode: 0o600 });
}

// Refuses to run against anything that isn't the local dev database.
export function assertLocalStrapiEnv() {
  const env = readEnv(STRAPI_ENV);
  const local = ['127.0.0.1', 'localhost'].includes(env.DATABASE_HOST) && Number(env.DATABASE_PORT) === DB.port;
  if (!local || env.DATABASE_NAME !== DB.name) {
    fail(`strapi/.env does not point at the local dev database (${DB.host}:${DB.port}/${DB.name}). Run "npm run setup" or fix it by hand.`);
  }
}

export function run(cmd, args, cwd, { prefix, env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: prefix ? 'pipe' : 'inherit' });
    if (prefix) pipeWithPrefix(child, prefix);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))));
  });
}

export function pipeWithPrefix(child, prefix) {
  for (const stream of [child.stdout, child.stderr]) {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) process.stdout.write(`${prefix} ${line}\n`);
    });
  }
}

export async function waitFor(url, { timeoutMs = 180000, ok = (r) => r.status < 500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (ok(await fetch(url))) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}
