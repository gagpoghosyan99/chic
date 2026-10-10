import Link from 'next/link';
import { ArrowRight, Plus, Upload } from 'lucide-react';
import { CONTENT_TYPES, SUBMISSION_TYPES } from '@/lib/content-types';
import { LANGS, LANG_SHORT, type Lang } from '@/lib/i18n';
import { panel, type Entry } from '@/lib/strapi';
import { getT } from '@/lib/ui-lang';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const { lang, t } = await getT();

  const lists = await Promise.all(
    CONTENT_TYPES.flatMap((type) =>
      (type.localized ? LANGS : [undefined]).map(async (locale) => ({
        type,
        locale: locale as Lang | undefined,
        entries: await panel.list(type.key, locale).catch(() => [] as Entry[]),
      })),
    ),
  );
  const submissions = await Promise.all(
    SUBMISSION_TYPES.map(async (s) => ({ type: s, entries: await panel.list(s.key).catch(() => [] as Entry[]) })),
  );

  const attention = lists.flatMap(({ type, locale, entries }) =>
    entries.filter((e) => e._status !== 'published').map((e) => ({ type, locale, entry: e })),
  );
  const recent = submissions
    .flatMap(({ type, entries }) => entries.map((e) => ({ type, entry: e })))
    .sort((a, b) => b.entry.createdAt.localeCompare(a.entry.createdAt))
    .slice(0, 6);

  const dateFmt = new Intl.DateTimeFormat(lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium' });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">{t('dash.welcome')} 👋</h1>
        <p className="mt-1 max-w-3xl text-slate-600">{t('dash.help')}</p>
      </header>

      <section className="flex flex-wrap gap-2">
        <Link href="/content/blog/new?lang=hy" className="btn-primary">
          <Plus className="size-4" /> {CONTENT_TYPES[0].label[lang]}
        </Link>
        <Link href="/content/courses/new?lang=hy" className="btn-secondary">
          <Plus className="size-4" /> {CONTENT_TYPES[1].label[lang]}
        </Link>
        <Link href="/media" className="btn-secondary">
          <Upload className="size-4" /> {t('nav.media')}
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CONTENT_TYPES.map((type) => {
          const perLang = lists.filter((l) => l.type.key === type.key);
          return (
            <Link key={type.key} href={`/content/${type.key}`} className="card group flex flex-col gap-2 p-4 transition hover:border-brand-light hover:shadow">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{type.label[lang]}</h2>
                <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand" />
              </div>
              <p className="text-sm text-slate-500">{type.description[lang]}</p>
              {type.localized && !type.single && (
                <div className="mt-auto flex gap-3 pt-1 text-xs text-slate-500">
                  {perLang.map((l) => (
                    <span key={l.locale}>
                      <span className="font-semibold text-slate-700">{LANG_SHORT[l.locale!]}</span> {l.entries.length}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">{t('dash.needsAttention')}</h2>
          {attention.length === 0 ? (
            <p className="text-sm text-slate-500">✓ {t('dash.allGood')}</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-slate-500">{t('dash.unpublishedCount', { n: attention.length })}</p>
              <ul className="divide-y divide-slate-100">
                {attention.slice(0, 8).map(({ type, locale, entry }) => (
                  <li key={`${type.key}-${entry.documentId}-${locale}`}>
                    <Link href={`/content/${type.key}/${entry.documentId}${locale ? `?lang=${locale}` : ''}`} className="flex items-center gap-3 py-2 text-sm hover:text-brand">
                      <span className="w-10 shrink-0 text-xs font-semibold text-slate-400">{locale ? LANG_SHORT[locale] : ''}</span>
                      <span className="min-w-0 flex-1 truncate">{String(entry[type.titleField] || '—')}</span>
                      <span className="hidden text-xs text-slate-400 sm:inline">{type.label[lang]}</span>
                      <StatusBadge status={entry._status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">{t('dash.recent')}</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">{t('subs.empty')}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map(({ type, entry }) => (
                <li key={entry.documentId}>
                  <Link href={`/submissions/${type.key}`} className="flex items-center gap-3 py-2 text-sm hover:text-brand">
                    <span className="min-w-0 flex-1 truncate">
                      {entry.full_name || [entry.name, entry.surname].filter(Boolean).join(' ') || '—'}
                      {entry.course && <span className="text-slate-400"> · {entry.course}</span>}
                    </span>
                    <span className="hidden text-xs text-slate-400 sm:inline">{type.label[lang]}</span>
                    <span className="text-xs text-slate-500">{dateFmt.format(new Date(entry.createdAt))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
