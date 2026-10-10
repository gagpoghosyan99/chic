'use client';

import { useRef, useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { ALLOWED_IMAGE_TYPES } from '@/lib/media-types';
import { useT } from '../I18n';

export function DropZone({ onFiles, uploading, compact }: { onFiles: (files: File[]) => void; uploading: boolean; compact?: boolean }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <button
      type="button"
      disabled={uploading}
      onClick={() => input.current?.click()}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition ${
        compact ? 'p-4' : 'p-8'
      } ${over ? 'border-brand bg-brand/5' : 'border-slate-300 bg-slate-50 hover:border-brand hover:bg-brand/5'}`}
    >
      {uploading ? <Loader2 className="size-7 animate-spin text-brand" /> : <UploadCloud className="size-7 text-brand" />}
      <span className="text-sm font-medium text-slate-700">{uploading ? t('media.uploading') : t('media.drop')}</span>
      <span className="text-xs text-slate-500">{t('media.onlyImages')} · ≤ 10 MB</span>
      <input
        ref={input}
        type="file"
        multiple
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
    </button>
  );
}
