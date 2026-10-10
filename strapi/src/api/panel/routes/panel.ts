const route = (method: string, path: string, handler: string) => ({
  method,
  path: `/panel${path}`,
  handler: `panel.${handler}`,
  config: { policies: ['api::panel.is-panel-token'] },
});

export default {
  routes: [
    route('GET', '/:type/entries', 'list'),
    route('GET', '/:type/entries/:documentId', 'findOne'),
    route('POST', '/:type/entries', 'create'),
    route('PUT', '/:type/entries/:documentId', 'update'),
    route('DELETE', '/:type/entries/:documentId', 'remove'),
    route('POST', '/:type/entries/:documentId/publish', 'publish'),
    route('POST', '/:type/entries/:documentId/unpublish', 'unpublish'),
    route('POST', '/:type/entries/:documentId/discard', 'discard'),
    route('POST', '/:type/entries/:documentId/link', 'link'),
    route('POST', '/:type/reorder', 'reorder'),
  ],
};
