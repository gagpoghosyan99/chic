import 'server-only';
import type { Lang } from './i18n';

export type EntryStatus = 'draft' | 'published' | 'modified';

export type MediaFile = {
  id: number;
  documentId?: string;
  name: string;
  url: string;
  mime: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alternativeText?: string | null;
  formats?: Record<string, { url: string; width: number; height: number }> | null;
  createdAt?: string;
};

export type Entry = Record<string, any> & {
  id: number;
  documentId: string;
  locale?: Lang | null;
  updatedAt: string;
  createdAt: string;
  _status: EntryStatus;
  _locales: Lang[];
};

export class StrapiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function config() {
  const url = process.env.STRAPI_URL;
  const token = process.env.STRAPI_TOKEN;
  if (!url || !token) throw new Error('STRAPI_URL and STRAPI_TOKEN must be set');
  return { url: url.replace(/\/$/, ''), token };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, token } = config();
  const res = await fetch(`${url}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {}
    throw new StrapiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const q = (params: Record<string, string | undefined>) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]).toString();
  return s ? `?${s}` : '';
};

export const panel = {
  list: (type: string, locale?: Lang) =>
    request<{ data: Entry[] }>(`/api/panel/${type}/entries${q({ locale })}`).then((r) => r.data),
  get: (type: string, documentId: string) =>
    request<{ data: Partial<Record<Lang | 'default', Entry>> }>(`/api/panel/${type}/entries/${documentId}`).then((r) => r.data),
  create: (type: string, locale: Lang | undefined, data: Record<string, unknown>) =>
    request<{ data: Entry }>(`/api/panel/${type}/entries${q({ locale })}`, { method: 'POST', body: JSON.stringify({ data }) }).then((r) => r.data),
  update: (type: string, documentId: string, locale: Lang | undefined, data: Record<string, unknown>) =>
    request<{ data: Entry }>(`/api/panel/${type}/entries/${documentId}${q({ locale })}`, { method: 'PUT', body: JSON.stringify({ data }) }).then((r) => r.data),
  remove: (type: string, documentId: string, locale: Lang | '*' | undefined) =>
    request(`/api/panel/${type}/entries/${documentId}${q({ locale })}`, { method: 'DELETE' }),
  action: (type: string, documentId: string, action: 'publish' | 'unpublish' | 'discard', locale?: Lang) =>
    request(`/api/panel/${type}/entries/${documentId}/${action}${q({ locale })}`, { method: 'POST' }),
  link: (type: string, documentId: string, locale: Lang, sourceDocumentId: string) =>
    request(`/api/panel/${type}/entries/${documentId}/link${q({ locale })}`, { method: 'POST', body: JSON.stringify({ sourceDocumentId }) }),
  reorder: (type: string, locale: Lang | '*', items: { documentId: string; sortOrder: number }[]) =>
    request(`/api/panel/${type}/reorder${q({ locale })}`, { method: 'POST', body: JSON.stringify({ items }) }),
};

export const media = {
  /** The content API ignores pagination params on this endpoint, so it always returns every file. */
  list: () => request<MediaFile[]>(`/api/upload/files${q({ sort: 'createdAt:desc' })}`),
  upload: async (files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append('files', file, file.name);
    return request<MediaFile[]>('/api/upload', { method: 'POST', body: form });
  },
  remove: (id: number) => request(`/api/upload/files/${id}`, { method: 'DELETE' }),
};

export function publicUrl(url: string | undefined | null) {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  return `${(process.env.STRAPI_PUBLIC_URL ?? process.env.STRAPI_URL ?? '').replace(/\/$/, '')}${url}`;
}
