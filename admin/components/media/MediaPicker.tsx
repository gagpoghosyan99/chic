'use client';

import type { MediaValue } from '@/lib/media-types';
import { useT } from '../I18n';
import { Modal } from '../ui/Modal';
import { DropZone } from './DropZone';
import { useMediaLibrary } from './useMediaLibrary';

export function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (file: MediaValue) => void }) {
  const t = useT();
  const lib = useMediaLibrary(open);

  return (
    <Modal open={open} onClose={onClose} title={t('media.pick')} wide>
      <div className="space-y-4">
        <DropZone
          compact
          uploading={lib.uploading}
          onFiles={async (files) => {
            const uploaded = await lib.upload(files);
            if (uploaded.length === 1) onSelect(uploaded[0]);
          }}
        />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {lib.items.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => onSelect(file)}
              title={file.name}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-100 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <img src={file.thumb} alt={file.name} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
              <span className="block truncate px-1.5 py-1 text-xs text-slate-600">{file.name}</span>
            </button>
          ))}
        </div>
        {lib.loading && <p className="text-center text-sm text-slate-500">{t('loading')}</p>}
        {lib.hasMore && !lib.loading && lib.items.length > 0 && (
          <div className="text-center">
            <button type="button" className="btn-secondary" onClick={lib.loadMore}>
              {t('media.more')}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
