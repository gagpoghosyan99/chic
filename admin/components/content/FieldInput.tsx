'use client';

import dynamic from 'next/dynamic';
import { useId } from 'react';
import type { Field } from '@/lib/content-types';
import type { MediaValue } from '@/lib/media-types';
import type { StrapiBlock } from '@/lib/blocks';
import { useLabel, useT } from '../I18n';
import { MediaField } from '../media/MediaField';

const RichTextEditor = dynamic(() => import('./RichTextEditor').then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />,
});

export function FieldInput({ field, value, onChange, error }: { field: Field; value: unknown; onChange: (v: unknown) => void; error?: string }) {
  const t = useT();
  const label = useLabel();
  const id = useId();

  const control = (() => {
    switch (field.type) {
      case 'string':
        return <input id={id} className="input" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
      case 'url':
        return <input id={id} className="input" type="url" inputMode="url" placeholder="https://" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
      case 'text':
        return <textarea id={id} className="input min-h-28 resize-y" rows={5} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
      case 'enum':
        return (
          <select id={id} className="input" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {field.options!.map((o) => (
              <option key={o.value} value={o.value}>
                {label(o.label)}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={value === true}
            onClick={() => onChange(!(value === true))}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${value === true ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block size-5 rounded-full bg-white shadow transition ${value === true ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        );
      case 'media':
        return <MediaField value={(value as MediaValue | null) ?? null} onChange={onChange} />;
      case 'richtext':
        return <RichTextEditor value={(value as StrapiBlock[]) ?? []} onChange={onChange} />;
    }
  })();

  return (
    <div className={field.type === 'boolean' ? 'flex items-start justify-between gap-4' : 'space-y-1.5'}>
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-800">
          {label(field.label)}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        {field.help && <p className="text-xs text-slate-500">{label(field.help)}</p>}
        {field.shared && <p className="text-xs text-brand">↔ {t('editor.shared')}</p>}
      </div>
      {control}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
