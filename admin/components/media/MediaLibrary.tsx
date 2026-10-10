'use client';

import { Copy, Trash2 } from 'lucide-react';
import { deleteMedia } from '@/app/actions';
import { useT } from '../I18n';
import { useConfirm } from '../ui/Confirm';
import { useToast } from '../ui/Toast';
import { DropZone } from './DropZone';
import { useMediaLibrary } from './useMediaLibrary';

const formatSize = (kb?: number) => (kb == null ? '' : kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`);

export function MediaLibrary() {
  const t = useT();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const lib = useMediaLibrary();

  const remove = async (id: number) => {
    if (!(await confirm(t('media.confirmDelete'), { danger: true, confirmLabel: t('delete') }))) return;
    const res = await deleteMedia(id);
    if (!res.ok) return toast('error', t('errorGeneric'));
    lib.removeLocal(id);
    toast('success', t('toast.deleted'));
  };

  return (
    <div className="space-y-5">
      <DropZone uploading={lib.uploading} onFiles={lib.upload} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {lib.items.map((file) => (
          <figure key={file.id} className="card group overflow-hidden">
            <a href={file.url} target="_blank" rel="noreferrer">
              <img src={file.thumb} alt={file.name} loading="lazy" className="aspect-square w-full bg-slate-100 object-cover" />
            </a>
            <figcaption className="space-y-1 p-2">
              <p className="truncate text-xs font-medium text-slate-700" title={file.name}>
                {file.name}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {file.width && file.height ? `${file.width}×${file.height} · ` : ''}
                  {formatSize(file.size)}
                </span>
                <span className="flex gap-0.5">
                  <button
                    type="button"
                    title="URL"
                    aria-label="Copy URL"
                    onClick={() => navigator.clipboard.writeText(file.url).then(() => toast('success', file.url))}
                    className="rounded p-1 hover:bg-slate-100"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <button type="button" title={t('delete')} aria-label={t('delete')} onClick={() => remove(file.id)} className="rounded p-1 text-red-600 hover:bg-red-50">
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
      {lib.loading && <p className="text-center text-sm text-slate-500">{t('loading')}</p>}
      {!lib.loading && lib.items.length === 0 && <p className="text-center text-slate-500">{t('list.empty')}</p>}
      {lib.hasMore && !lib.loading && lib.items.length > 0 && (
        <div className="text-center">
          <button type="button" className="btn-secondary" onClick={lib.loadMore}>
            {t('media.more')}
          </button>
        </div>
      )}
      {dialog}
    </div>
  );
}
