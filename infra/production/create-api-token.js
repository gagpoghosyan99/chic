// Runs inside a Strapi container: creates (or replaces) a full-access API token named
// $TOKEN_NAME and prints it. Loads Strapi without starting a second HTTP server.
const { createStrapi } = require('@strapi/strapi');

(async () => {
  const app = await createStrapi({ appDir: '/app/chic', distDir: '/app/chic/dist' }).load();
  const tokens = app.service('admin::api-token');
  const name = process.env.TOKEN_NAME;
  const existing = await app.db.query('admin::api-token').findOne({ where: { name } });
  if (existing) await tokens.revoke(existing.id);
  const token = await tokens.create({
    name,
    description: 'Used by the CHIC admin panel (chic.ngo/admin)',
    type: 'full-access',
    lifespan: null,
  });
  console.log(`ACCESS_KEY=${token.accessKey}`);
  await app.destroy();
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
