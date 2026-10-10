import { notFound, redirect } from 'next/navigation';
import { getContentType } from '@/lib/content-types';
import { LANGS, isLang, type Lang } from '@/lib/i18n';
import { panel } from '@/lib/strapi';
import { sortRows, toRow } from '@/lib/rows';
import { EntryList } from '@/components/content/EntryList';

export const dynamic = 'force-dynamic';

export default async function ContentListPage({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { type: key } = await params;
  const type = getContentType(key);
  if (!type) notFound();
  const sp = await searchParams;
  const lang: Lang = isLang(sp.lang) ? sp.lang : 'hy';

  if (type.single) {
    const entries = await panel.list(type.key, type.localized ? lang : undefined);
    const first = entries[0];
    redirect(first ? `/content/${type.key}/${first.documentId}?lang=${lang}` : `/content/${type.key}/new?lang=${lang}`);
  }

  const all = await Promise.all(LANGS.map(async (l) => [l, await panel.list(type.key, l)] as const));
  const counts = Object.fromEntries(all.map(([l, e]) => [l, e.length])) as Record<Lang, number>;
  const rows = sortRows(all.find(([l]) => l === lang)![1].map((e) => toRow(e, type)), type, lang);

  return <EntryList typeKey={type.key} lang={lang} rows={rows} counts={counts} />;
}
