'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getContentType } from '@/lib/content-types';
import { LANGS, LANG_NAMES, type Lang } from '@/lib/i18n';
import type { FormValues, Version } from '@/lib/editor-data';
import { useLabel, useT } from '../I18n';
import { LocaleColumn } from './LocaleColumn';

export type Candidate = { documentId: string; title: string };

export function Editor({
  typeKey,
  documentId,
  initialLang,
  versions,
  empty,
  candidates,
  siteUrl,
}: {
  typeKey: string;
  documentId: string | null;
  initialLang: Lang;
  versions: Partial<Record<Lang | 'default', Version>>;
  empty: FormValues;
  candidates: Partial<Record<Lang, Candidate[]>>;
  siteUrl: string;
}) {
  const type = getContentType(typeKey)!;
  const t = useT();
  const label = useLabel();
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const ordered = useMemo(() => [initialLang, ...LANGS.filter((l) => l !== initialLang)], [initialLang]);
  const [visible, setVisible] = useState<Lang[]>(() => (documentId ? ordered : [initialLang]));
  const anyDirty = Object.values(dirty).some(Boolean);

  useEffect(() => {
    if (!anyDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [anyDirty]);

  const onDirty = useCallback((key: string, value: boolean) => setDirty((d) => (d[key] === value ? d : { ...d, [key]: value })), []);

  const title = String(
    (type.localized ? versions[initialLang]?.values : versions.default?.values)?.[type.titleField] ||
      Object.values(versions).find(Boolean)?.values[type.titleField] ||
      (documentId ? '—' : t('editor.newTitle')),
  );
  const backHref = type.single ? '/' : `/content/${type.key}?lang=${initialLang}`;
  const columns = type.localized ? ordered.filter((l) => visible.includes(l)) : [undefined];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={backHref}
            onClick={(e) => anyDirty && !window.confirm(t('editor.leaveConfirm')) && e.preventDefault()}
            className="mb-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand"
          >
            <ArrowLeft className="size-4" /> {type.single ? t('nav.dashboard') : label(type.label)}
          </Link>
          <h1 className="truncate text-2xl font-semibold">{type.single ? label(type.label) : title}</h1>
          {type.single && <p className="text-slate-600">{label(type.description)}</p>}
        </div>
        {type.localized && documentId && (
          <fieldset className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 text-sm">
            <legend className="sr-only">{t('editor.languages')}</legend>
            {ordered.map((l) => {
              const on = visible.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setVisible((v) => (on ? (v.length > 1 ? v.filter((x) => x !== l) : v) : [...v, l]))}
                  className={`rounded-lg px-3 py-1 font-medium transition ${on ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {on ? '✓ ' : ''}
                  {LANG_NAMES[l]}
                </button>
              );
            })}
          </fieldset>
        )}
      </header>

      {anyDirty && <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">{t('editor.unsaved')}</p>}

      <div className={`grid items-start gap-5 ${columns.length >= 3 ? 'xl:grid-cols-3' : columns.length === 2 ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
        {columns.map((locale) => {
          const key = locale ?? 'default';
          const others = LANGS.filter((l) => l !== locale && versions[l]).map((l) => ({ lang: l, values: versions[l]!.values }));
          return (
            <LocaleColumn
              key={key}
              typeKey={type.key}
              documentId={documentId}
              locale={locale}
              version={versions[key as Lang | 'default']}
              empty={empty}
              others={others}
              candidates={locale ? candidates[locale] ?? [] : []}
              siteUrl={siteUrl}
              isOnlyVersion={Object.keys(versions).length <= 1}
              onDirty={onDirty}
            />
          );
        })}
      </div>
    </div>
  );
}
