import { notFound } from 'next/navigation';
import { getContentType } from '@/lib/content-types';
import { LANGS, isLang, type Lang } from '@/lib/i18n';
import { panel, StrapiError } from '@/lib/strapi';
import { emptyValues, toVersion, type Version } from '@/lib/editor-data';
import { Editor } from '@/components/content/Editor';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params, searchParams }: { params: Promise<{ type: string; id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { type: key, id } = await params;
  const type = getContentType(key);
  if (!type) notFound();
  const sp = await searchParams;
  const lang: Lang = isLang(sp.lang) ? sp.lang : 'hy';
  const siteUrl = (process.env.SITE_URL ?? 'https://chic.ngo').replace(/\/$/, '');

  if (id === 'new') {
    return <Editor typeKey={type.key} documentId={null} initialLang={lang} versions={{}} empty={emptyValues(type)} candidates={{}} siteUrl={siteUrl} />;
  }

  let raw;
  try {
    raw = await panel.get(type.key, id);
  } catch (e) {
    if (e instanceof StrapiError && e.status === 404) notFound();
    throw e;
  }

  const versions: Partial<Record<Lang | 'default', Version>> = {};
  for (const [locale, entry] of Object.entries(raw)) if (entry) versions[locale as Lang] = toVersion(type, entry);

  const candidates: Partial<Record<Lang, { documentId: string; title: string }[]>> = {};
  if (type.localized) {
    for (const l of LANGS.filter((l) => !versions[l])) {
      const entries = await panel.list(type.key, l);
      candidates[l] = entries
        .filter((e) => e.documentId !== id && e._locales.length === 1)
        .map((e) => ({ documentId: e.documentId, title: String(e[type.titleField] || '—') }))
        .sort((a, b) => a.title.localeCompare(b.title, l));
    }
  }

  return <Editor typeKey={type.key} documentId={id} initialLang={lang} versions={versions} empty={emptyValues(type)} candidates={candidates} siteUrl={siteUrl} />;
}
