'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, type MediaValue } from '@/lib/media-types';
import { useT } from '../I18n';
import { useToast } from '../ui/Toast';

export function useMediaLibrary(active = true) {
  const t = useT();
  const toast = useToast();
  const [items, setItems] = useState<MediaValue[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async (next: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?page=${next}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const json: { data: MediaValue[]; hasMore: boolean } = await res.json();
      setItems((prev) => {
        const base = next === 1 ? [] : prev;
        const seen = new Set(base.map((i) => i.id));
        return [...base, ...json.data.filter((i) => !seen.has(i.id))];
      });
      setHasMore(json.hasMore);
      setPage(next);
    } catch {
      toast('error', t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    load(1);
  }, [active, load]);

  const upload = useCallback(
    async (files: File[]): Promise<MediaValue[]> => {
      const valid = files.filter((f) => {
        if (!ALLOWED_IMAGE_TYPES.includes(f.type)) return toast('error', `${f.name}: ${t('media.onlyImages')}`), false;
        if (f.size > MAX_UPLOAD_BYTES) return toast('error', `${f.name}: ${t('media.tooBig')}`), false;
        return true;
      });
      if (!valid.length) return [];
      setUploading(true);
      try {
        const body = new FormData();
        valid.forEach((f) => body.append('files', f));
        const res = await fetch('/api/media', { method: 'POST', body });
        if (!res.ok) throw new Error(String(res.status));
        const { data }: { data: MediaValue[] } = await res.json();
        setItems((prev) => [...data, ...prev]);
        toast('success', t('toast.uploaded'));
        return data;
      } catch {
        toast('error', t('errorGeneric'));
        return [];
      } finally {
        setUploading(false);
      }
    },
    [t, toast],
  );

  const removeLocal = useCallback((id: number) => setItems((prev) => prev.filter((i) => i.id !== id)), []);

  return { items, hasMore, loading, uploading, loadMore: () => load(page + 1), upload, removeLocal };
}
