import type { Core } from '@strapi/strapi';

const TYPES: Record<string, string> = {
  blog: 'api::blog.blog',
  courses: 'api::courses.courses',
  history: 'api::history.history',
  team: 'api::our-team.our-team',
  lecturers: 'api::our-lecturers.our-lecturers',
  partners: 'api::our-partners.our-partners',
  volunteers: 'api::our-volunteers.our-volunteers',
  licensing: 'api::licensing-consulting.licensing-consulting',
  quality: 'api::quality-management-system-consulting.quality-management-system-consulting',
  construction: 'api::construction-renovation-and-equipment-supply.construction-renovation-and-equipment-supply',
  social: 'api::social-media.social-media',
  registrations: 'api::registered-for-the-courses.registered-for-the-courses',
  'volunteer-applications': 'api::volunteers.volunteers',
};

const LOCALES = ['hy', 'ru', 'en'];
const SYSTEM_FIELDS = ['id', 'documentId', 'locale', 'createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy', 'localizations'];

type Status = 'draft' | 'published' | 'modified';

const getStrapi = (): Core.Strapi => (global as any).strapi;

function resolve(ctx: any) {
  const uid = TYPES[ctx.params.type];
  if (!uid) ctx.throw(404, 'Unknown content type');
  const model = getStrapi().contentType(uid as any) as any;
  const localized = model?.pluginOptions?.i18n?.localized === true;
  const mediaFields = Object.entries(model.attributes)
    .filter(([, a]: any) => a.type === 'media')
    .map(([k]) => k);
  return { uid: uid as any, model, localized, mediaFields };
}

function localeOf(ctx: any, localized: boolean): string | undefined {
  if (!localized) return undefined;
  const locale = String(ctx.query.locale ?? ctx.request.body?.locale ?? '');
  if (!LOCALES.includes(locale)) ctx.throw(400, 'Invalid locale');
  return locale;
}

function cleanData(model: any, data: any) {
  const out: Record<string, any> = {};
  for (const [key, attr] of Object.entries<any>(model.attributes)) {
    if (SYSTEM_FIELDS.includes(key) || !(key in (data ?? {}))) continue;
    const value = data[key];
    if (attr.type === 'media') {
      out[key] = value && typeof value === 'object' ? value.id : value ?? null;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function statusOf(draft: any, published: any): Status {
  if (!published) return 'draft';
  return new Date(draft.updatedAt).getTime() - new Date(published.updatedAt).getTime() > 1000 ? 'modified' : 'published';
}

async function versionsByDocument(uid: any, localized: boolean, where: Record<string, any>) {
  const rows = await getStrapi().db.query(uid).findMany({
    where,
    select: ['documentId', 'updatedAt', 'publishedAt', ...(localized ? ['locale'] : [])],
  });
  return rows;
}

export default {
  async list(ctx: any) {
    const { uid, localized, mediaFields } = resolve(ctx);
    const locale = localeOf(ctx, localized);
    const docs = getStrapi().documents(uid);

    const drafts: any[] = await docs.findMany({
      ...(locale ? { locale } : {}),
      status: 'draft',
      populate: mediaFields,
      limit: 2000,
    } as any);

    const published = await versionsByDocument(uid, localized, {
      publishedAt: { $notNull: true },
      ...(locale ? { locale } : {}),
    });
    const publishedMap = new Map(published.map((p: any) => [p.documentId, p]));

    let localesMap = new Map<string, string[]>();
    if (localized) {
      const all = await versionsByDocument(uid, true, { publishedAt: { $null: true } });
      for (const row of all as any[]) {
        localesMap.set(row.documentId, [...(localesMap.get(row.documentId) ?? []), row.locale]);
      }
    }

    ctx.body = {
      data: drafts.map((d) => ({
        ...d,
        _status: statusOf(d, publishedMap.get(d.documentId)),
        _locales: localesMap.get(d.documentId) ?? [],
      })),
    };
  },

  async findOne(ctx: any) {
    const { uid, localized, mediaFields } = resolve(ctx);
    const { documentId } = ctx.params;
    const docs = getStrapi().documents(uid);
    const locales = localized ? LOCALES : [undefined];
    const result: Record<string, any> = {};

    for (const locale of locales) {
      const draft = await docs.findOne({ documentId, ...(locale ? { locale } : {}), status: 'draft', populate: mediaFields } as any);
      if (!draft) continue;
      const published = await docs.findOne({ documentId, ...(locale ? { locale } : {}), status: 'published', fields: ['updatedAt'] } as any);
      result[locale ?? 'default'] = { ...draft, _status: statusOf(draft, published) };
    }

    if (Object.keys(result).length === 0) ctx.throw(404, 'Not found');
    ctx.body = { data: result };
  },

  async create(ctx: any) {
    const { uid, model, localized } = resolve(ctx);
    const locale = localeOf(ctx, localized);
    const data = cleanData(model, ctx.request.body?.data);
    const created = await getStrapi().documents(uid).create({ ...(locale ? { locale } : {}), data } as any);
    ctx.body = { data: created };
  },

  async update(ctx: any) {
    const { uid, model, localized } = resolve(ctx);
    const locale = localeOf(ctx, localized);
    const data = cleanData(model, ctx.request.body?.data);
    const updated = await getStrapi().documents(uid).update({
      documentId: ctx.params.documentId,
      ...(locale ? { locale } : {}),
      data,
    } as any);
    ctx.body = { data: updated };
  },

  async remove(ctx: any) {
    const { uid, localized } = resolve(ctx);
    const all = ctx.query.locale === '*';
    const locale = all ? '*' : localeOf(ctx, localized);
    await getStrapi().documents(uid).delete({ documentId: ctx.params.documentId, ...(locale ? { locale } : {}) } as any);
    ctx.body = { ok: true };
  },

  async publish(ctx: any) {
    const { uid, localized } = resolve(ctx);
    const locale = localeOf(ctx, localized);
    await getStrapi().documents(uid).publish({ documentId: ctx.params.documentId, ...(locale ? { locale } : {}) } as any);
    ctx.body = { ok: true };
  },

  async unpublish(ctx: any) {
    const { uid, localized } = resolve(ctx);
    const locale = localeOf(ctx, localized);
    await getStrapi().documents(uid).unpublish({ documentId: ctx.params.documentId, ...(locale ? { locale } : {}) } as any);
    ctx.body = { ok: true };
  },

  async discard(ctx: any) {
    const { uid, localized } = resolve(ctx);
    const locale = localeOf(ctx, localized);
    await getStrapi().documents(uid).discardDraft({ documentId: ctx.params.documentId, ...(locale ? { locale } : {}) } as any);
    ctx.body = { ok: true };
  },

  // Moves the `locale` version of another document (sourceDocumentId) into this document,
  // so separately created translations become one entry with several languages.
  async link(ctx: any) {
    const { uid, model, localized, mediaFields } = resolve(ctx);
    if (!localized) ctx.throw(400, 'Content type is not translatable');
    const locale = localeOf(ctx, true)!;
    const targetId = ctx.params.documentId;
    const sourceId = String(ctx.request.body?.sourceDocumentId ?? '');
    if (!sourceId || sourceId === targetId) ctx.throw(400, 'Invalid source');

    const docs = getStrapi().documents(uid);
    const existing = await docs.findOne({ documentId: targetId, locale, status: 'draft' } as any);
    if (existing) ctx.throw(409, 'This entry already has that language');

    const sourceLocales = await versionsByDocument(uid, true, { documentId: sourceId, publishedAt: { $null: true } });
    if (sourceLocales.length !== 1 || (sourceLocales[0] as any).locale !== locale) {
      ctx.throw(409, 'Source entry must exist only in the requested language');
    }

    const sourceDraft = await docs.findOne({ documentId: sourceId, locale, status: 'draft', populate: mediaFields } as any);
    const sourcePublished = await docs.findOne({ documentId: sourceId, locale, status: 'published', populate: mediaFields } as any);
    if (!sourceDraft) ctx.throw(404, 'Source not found');

    await getStrapi().db.transaction(async () => {
      if (sourcePublished) {
        const publishedData = cleanData(model, sourcePublished);
        const draftData = cleanData(model, sourceDraft);
        await docs.update({ documentId: targetId, locale, data: publishedData } as any);
        await docs.publish({ documentId: targetId, locale } as any);
        if (JSON.stringify(draftData) !== JSON.stringify(publishedData)) {
          await docs.update({ documentId: targetId, locale, data: draftData } as any);
        }
      } else {
        await docs.update({ documentId: targetId, locale, data: cleanData(model, sourceDraft) } as any);
      }
      await docs.delete({ documentId: sourceId, locale: '*' } as any);
    });

    ctx.body = { ok: true };
  },

  // Writes sortOrder on both draft and published rows directly, so reordering
  // never publishes unrelated pending draft changes.
  async reorder(ctx: any) {
    const { uid, model, localized } = resolve(ctx);
    if (!model.attributes.sortOrder) ctx.throw(400, 'Content type has no order');
    const locale = ctx.query.locale === '*' ? undefined : localeOf(ctx, localized);
    const items: Array<{ documentId: string; sortOrder: number }> = ctx.request.body?.items ?? [];
    if (!Array.isArray(items)) ctx.throw(400, 'Invalid items');

    const meta: any = getStrapi().db.metadata.get(uid);
    const column = meta.attributes.sortOrder.columnName ?? 'sort_order';
    const knex = getStrapi().db.connection;
    await knex.transaction(async (trx) => {
      for (const item of items) {
        await trx(meta.tableName)
          .where({ document_id: String(item.documentId), ...(locale ? { locale } : {}) })
          .update({ [column]: Number(item.sortOrder) });
      }
    });
    ctx.body = { ok: true };
  },
};
