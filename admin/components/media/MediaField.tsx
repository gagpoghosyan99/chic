'use client';

import { useState } from 'react';
import { ImageIcon, RefreshCw, X } from 'lucide-react';
import type { MediaValue } from '@/lib/media-types';
import { useT } from '../I18n';
import { MediaPicker } from './MediaPicker';

export function MediaField({ value, onChange }: { value: MediaValue | null; onChange: (v: MediaValue | null) => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:border-brand"
      >
        {value ? <img src={value.thumb} alt={value.name} className="size-full object-cover" /> : <ImageIcon className="size-8 text-slate-300" />}
      </button>
      <div className="min-w-0 space-y-2">
        <p className="truncate text-sm text-slate-600">{value ? value.name : t('media.none')}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => setOpen(true)}>
            {value ? <RefreshCw className="size-4" /> : <ImageIcon className="size-4" />} {value ? t('change') : t('media.pick')}
          </button>
          {value && (
            <button type="button" className="btn-ghost text-red-700" onClick={() => onChange(null)}>
              <X className="size-4" /> {t('remove')}
            </button>
          )}
        </div>
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(file) => {
          onChange(file);
          setOpen(false);
        }}
      />
    </div>
  );
}
