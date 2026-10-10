import 'server-only';
import type { ContentType } from './content-types';
import { publicUrl, type Entry, type EntryStatus } from './strapi';
import type { Lang } from './i18n';

export type Row = {
  documentId: string;
  title: string;
  subtitle: string;
  thumb: string | null;
  status: EntryStatus;
  locales: Lang[];
  sortOrder: number | null;
  available: boolean | null;
  updatedAt: string;
};

export function toRow(entry: Entry, type: ContentType): Row {
  const image = type.imageField ? entry[type.imageField] : null;
  return {
    documentId: entry.documentId,
    title: String(entry[type.titleField] ?? '').trim(),
    subtitle: type.subtitleField ? String(entry[type.subtitleField] ?? '') : '',
    thumb: image ? publicUrl(image.formats?.thumbnail?.url ?? image.url) : null,
    status: entry._status,
    locales: entry._locales,
    sortOrder: entry.sortOrder != null ? Number(entry.sortOrder) : null,
    // The website treats an unset value as "closed".
    available: 'is_available' in entry ? entry.is_available === true : null,
    updatedAt: entry.updatedAt,
  };
}

export function sortRows(rows: Row[], type: ContentType, lang: Lang) {
  if (!type.sortable) return [...rows].sort((a, b) => a.title.localeCompare(b.title, lang));
  return [...rows].sort((a, b) => {
    if (a.sortOrder == null || b.sortOrder == null) return a.sortOrder == null ? (b.sortOrder == null ? 0 : 1) : -1;
    return type.sortable === 'desc' ? b.sortOrder - a.sortOrder : a.sortOrder - b.sortOrder;
  });
}
