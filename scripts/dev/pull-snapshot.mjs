import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { log, fail, DEV_DIR, SNAPSHOT, STRAPI_DIR } from './lib.mjs';

// Read-only: dumps the production database and copies uploaded images. Nothing is written to production.
const host = process.env.CHIC_SSH_HOST || 'chic-prod';
fs.mkdirSync(DEV_DIR, { recursive: true, mode: 0o700 });

const tmp = `${SNAPSHOT}.tmp`;
log(`Dumping production database from ${host} (read-only)...`);
try {
  execSync(
    `ssh -o BatchMode=yes ${host} "docker exec strapi-db pg_dump -U strapi -d strapi --inserts --no-owner --no-privileges" > "${tmp}"`,
    { stdio: ['ignore', 'inherit', 'inherit'], shell: '/bin/bash' },
  );
} catch {
  fs.rmSync(tmp, { force: true });
  fail(`Could not dump the database. Check that "ssh ${host}" works.`);
}
fs.renameSync(tmp, SNAPSHOT);
fs.chmodSync(SNAPSHOT, 0o600);

log('Copying uploaded images...');
const uploads = path.join(STRAPI_DIR, 'public', 'uploads');
fs.mkdirSync(uploads, { recursive: true });
execSync(`rsync -az ${host}:/root/chic-strapi/chic/public/uploads/ "${uploads}/"`, { stdio: 'inherit' });

log('Snapshot saved to .dev/snapshot.sql (contains personal data; git-ignored).');
log('Load it into the dev database with: npm run db:reset');
