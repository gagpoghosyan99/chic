'use client';

import { ExternalLink, ImageIcon } from 'lucide-react';
import { getContentType } from '@/lib/content-types';
import type { FormValues } from '@/lib/editor-data';
import { LANG_NAMES, translate, type Lang } from '@/lib/i18n';
import type { MediaValue } from '@/lib/media-types';
import type { StrapiBlock } from '@/lib/blocks';
import { useLabel, useT } from '../I18n';
import { Modal } from '../ui/Modal';
import { BlocksView } from './BlocksView';

function Photo({ file, className }: { file: unknown; className: string }) {
  const media = file as MediaValue | null;
  return media ? (
    <img src={media.url} alt="" className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
      <ImageIcon className="size-8 text-slate-300" />
    </div>
  );
}

export function Preview({ open, onClose, typeKey, values, locale }: { open: boolean; onClose: () => void; typeKey: string; values: FormValues; locale: Lang }) {
  const type = getContentType(typeKey)!;
  const t = useT();
  const label = useLabel();
  const str = (name: string) => String(values[name] ?? '');
  const enumLabel = (name: string) => {
    const option = type.fields.find((f) => f.name === name)?.options?.find((o) => o.value === values[name]);
    return option ? option.label[locale] : str(name);
  };

  const body = (() => {
    switch (type.preview) {
      case 'blog':
        return (
          <article className="mx-auto max-w-3xl space-y-5">
            {values.cover_image ? <Photo file={values.cover_image} className="max-h-[420px] w-full rounded-xl" /> : null}
            <h1 className="text-3xl font-bold text-brand">{str('title') || '—'}</h1>
            <BlocksView blocks={values.content as StrapiBlock[]} />
          </article>
        );
      case 'course': {
        const open = values.is_available === true;
        return (
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <Photo file={values.cover_image} className="aspect-[4/3] w-full" />
            <div className="space-y-3 p-5">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{enumLabel('type')}</p>
              <h2 className="text-xl font-semibold text-brand">{str('title') || '—'}</h2>
              <p className="text-sm whitespace-pre-line text-slate-700">{str('description')}</p>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${open ? 'bg-accent text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                {translate(locale, open ? 'course.open' : 'course.closed')}
              </span>
            </div>
          </div>
        );
      }
      case 'person':
        return (
          <div className="mx-auto flex max-w-xs flex-col items-center gap-3 text-center">
            {type.imageField && <Photo file={values[type.imageField]} className="size-40 rounded-full" />}
            <h2 className="text-lg font-semibold text-brand">{str('full_name') || '—'}</h2>
            {str('profession') && <p className="text-slate-600">{str('profession')}</p>}
          </div>
        );
      case 'history':
        return (
          <article className="mx-auto max-w-3xl space-y-6">
            <p className="text-lg whitespace-pre-line text-slate-700">{str('about')}</p>
            <BlocksView blocks={values.history as StrapiBlock[]} />
            <div className="flex items-center gap-4 border-t border-slate-200 pt-5">
              <Photo file={values.founder_photo} className="size-24 rounded-full" />
              <p className="text-lg font-semibold text-brand">{str('founder_full_name') || '—'}</p>
            </div>
          </article>
        );
      case 'card':
        return (
          <div className="mx-auto max-w-sm space-y-2 rounded-2xl border border-slate-200 p-5 shadow-sm">
            {type.fields.map((f) => {
              const v = f.type === 'enum' ? enumLabel(f.name) : str(f.name);
              if (!v) return null;
              if (f.type === 'url')
                return (
                  <a key={f.name} href={v} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm break-all text-brand underline">
                    {type.localized ? '' : `${label(f.label)}: `}
                    {v} <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                );
              return (
                <p key={f.name} className={f.name === type.titleField ? 'text-lg font-semibold text-brand' : 'text-sm text-slate-600'}>
                  {v}
                </p>
              );
            })}
          </div>
        );
    }
  })();

  return (
    <Modal open={open} onClose={onClose} wide title={`${t('preview')}${type.localized ? ` · ${LANG_NAMES[locale]}` : ''}`}>
      <p className="mb-5 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">{t('preview.note')}</p>
      <div lang={locale}>{body}</div>
    </Modal>
  );
}
