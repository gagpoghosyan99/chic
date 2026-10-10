import 'server-only';
import type { ContentType } from './content-types';
import type { MediaValue } from './media-types';
import { publicUrl, type Entry, type EntryStatus, type MediaFile } from './strapi';

export type FormValues = Record<string, unknown>;
export type Version = { status: EntryStatus; updatedAt: string; values: FormValues };

export function toMediaValue(file: MediaFile | null | undefined): MediaValue | null {
  if (!file) return null;
  return {
    id: file.id,
    url: publicUrl(file.url),
    thumb: publicUrl(file.formats?.small?.url ?? file.formats?.thumbnail?.url ?? file.url),
    name: file.name,
    width: file.width,
    height: file.height,
    size: file.size,
    createdAt: file.createdAt,
    raw: { ...file, url: publicUrl(file.url) },
  };
}

export function toVersion(type: ContentType, entry: Entry): Version {
  const values: FormValues = {};
  for (const field of type.fields) {
    const value = entry[field.name];
    if (field.type === 'media') values[field.name] = toMediaValue(value);
    else if (field.type === 'boolean') values[field.name] = value === true;
    else if (field.type === 'richtext') values[field.name] = Array.isArray(value) ? value : [];
    else values[field.name] = value ?? '';
  }
  return { status: entry._status, updatedAt: entry.updatedAt, values };
}

export function emptyValues(type: ContentType): FormValues {
  const values: FormValues = {};
  for (const field of type.fields) {
    values[field.name] = field.type === 'media' ? null : field.type === 'boolean' ? field.name === 'is_available' : field.type === 'richtext' ? [] : '';
  }
  return values;
}
