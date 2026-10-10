import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
if (!fs.existsSync(path.join(root, 'node_modules', 'embedded-postgres'))) {
  console.log('[chic] Installing root dev tools...');
  execSync('npm install --no-audit --no-fund', { cwd: root, stdio: 'inherit' });
}

const lib = await import('./lib.mjs');
const { log, fail, checkNode, run, postgres, isInitialised, databaseExists, loadSnapshot, secret, readEnv, writeEnv } = lib;
const { DB, DEV_DIR, SNAPSHOT, CREDENTIALS, STRAPI_DIR, ADMIN_DIR, STRAPI_ENV, ADMIN_ENV, STRAPI_URL, ADMIN_URL } = lib;

const reset = process.argv.includes('--reset');
checkNode();
fs.mkdirSync(DEV_DIR, { recursive: true, mode: 0o700 });

if (!reset) {
  for (const [name, dir] of [['Strapi', STRAPI_DIR], ['admin panel', ADMIN_DIR]]) {
    log(`Installing ${name} dependencies...`);
    const lock = fs.existsSync(path.join(dir, 'package-lock.json'));
    await run('npm', [lock ? 'ci' : 'install', '--no-audit', '--no-fund'], dir);
  }
}

const pg = postgres();
if (!isInitialised()) {
  log('Creating local Postgres cluster in .dev/pgdata ...');
  await pg.initialise();
}
await pg.start();
try {
  const exists = await databaseExists(pg);
  if (exists && reset) {
    log(`Dropping dev database "${DB.name}"...`);
    await pg.dropDatabase(DB.name);
  }
  if (!exists || reset) {
    log(`Creating dev database "${DB.name}"...`);
    await pg.createDatabase(DB.name);
    if (fs.existsSync(SNAPSHOT)) {
      log('Loading production snapshot from .dev/snapshot.sql ...');
      await loadSnapshot(pg);
    } else {
      log('No snapshot found: Strapi will start with empty content. Run "npm run db:pull" then "npm run db:reset" to load real content.');
    }
  } else {
    log(`Dev database "${DB.name}" already exists (use "npm run db:reset" to recreate it).`);
  }
} finally {
  await pg.stop();
}

const strapiEnv = readEnv(STRAPI_ENV);
const pointsAtDev = strapiEnv.DATABASE_NAME === DB.name && Number(strapiEnv.DATABASE_PORT) === DB.port;
if (!pointsAtDev) {
  if (fs.existsSync(STRAPI_ENV)) fs.copyFileSync(STRAPI_ENV, `${STRAPI_ENV}.bak`);
  log('Writing strapi/.env for local development...');
  writeEnv(STRAPI_ENV, {
    HOST: '127.0.0.1',
    PORT: 1337,
    APP_KEYS: `${secret()},${secret()}`,
    API_TOKEN_SALT: secret(),
    ADMIN_JWT_SECRET: secret(),
    TRANSFER_TOKEN_SALT: secret(),
    ENCRYPTION_KEY: secret(),
    JWT_SECRET: secret(),
    DATABASE_CLIENT: 'postgres',
    DATABASE_HOST: DB.host,
    DATABASE_PORT: DB.port,
    DATABASE_NAME: DB.name,
    DATABASE_USERNAME: DB.user,
    DATABASE_PASSWORD: DB.password,
    DATABASE_SSL: 'false',
  });
}

const adminEnv = readEnv(ADMIN_ENV);
if (!adminEnv.ADMIN_PASSWORD_HASH || reset) {
  const password = `chic-${crypto.randomBytes(4).toString('hex')}`;
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  writeEnv(ADMIN_ENV, {
    STRAPI_URL,
    STRAPI_PUBLIC_URL: STRAPI_URL,
    SITE_URL: 'http://localhost:3000',
    SESSION_SECRET: crypto.randomBytes(32).toString('base64url'),
    ADMIN_PASSWORD_HASH: `scrypt.${salt.toString('base64url')}.${hash.toString('base64url')}`,
  });
  fs.writeFileSync(CREDENTIALS, `Admin panel (${ADMIN_URL})\n  password: ${password}\n`, { mode: 0o600 });
  log(`Admin panel dev password saved to .dev/dev-credentials.txt`);
}

log('Setup complete. Start everything with: npm run dev');
