'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearFailures, clientIp, endSession, isRateLimited, recordFailure, requireSession, startSession, verifyPassword } from '@/lib/auth';
import { getContentType, getSubmissionType, type ContentType } from '@/lib/content-types';
import { isLang, type Lang } from '@/lib/i18n';
import { media, panel, StrapiError } from '@/lib/strapi';
import { UI_LANG_COOKIE } from '@/lib/ui-lang';

export type ActionResult = { ok: true; documentId?: string } | { ok: false; error: string; fields?: Record<string, string> };

const fail = (error: string, fields?: Record<string, string>): ActionResult => ({ ok: false, error, fields });

async function guard<T extends ActionResult>(fn: () => Promise<T>): Promise<ActionResult> {
  await requireSession();
  try {
    return await fn();
  } catch (e) {
    if (e instanceof StrapiError) return fail(e.message);
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    console.error(e);
    return fail('unknown');
  }
}

function resolveType(key: string): ContentType {
  const type = getContentType(key);
  if (!type) throw new StrapiError(404, 'Unknown content type');
  return type;
}

function resolveLocale(type: ContentType, locale: unknown): Lang | undefined {
  if (!type.localized) return undefined;
  if (!isLang(locale)) throw new StrapiError(400, 'Invalid language');
  return locale;
}

function cleanData(type: ContentType, input: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const field of type.fields) {
    if (!(field.name in input)) continue;
    let value = input[field.name];
    switch (field.type) {
      case 'string':
      case 'text':
        value = typeof value === 'string' ? value.trim() : '';
        if (field.required && !value) errors[field.name] = 'required';
        break;
      case 'url':
        value = typeof value === 'string' ? value.trim() : '';
        if (value && !/^https?:\/\/[^\s]+$/i.test(value as string)) errors[field.name] = 'url';
        break;
      case 'enum':
        if (!field.options?.some((o) => o.value === value)) {
          if (field.required || value) errors[field.name] = 'required';
          value = null;
        }
        break;
      case 'boolean':
        value = value === true;
        break;
      case 'media':
        value = typeof value === 'number' && Number.isInteger(value) ? value : null;
        break;
      case 'richtext':
        value = Array.isArray(value) ? value : [];
        break;
    }
    data[field.name] = value;
  }
  return { data, errors };
}

function refresh(typeKey: string) {
  revalidatePath(`/content/${typeKey}`, 'layout');
  revalidatePath('/');
}

export async function login(_: unknown, formData: FormData): Promise<{ error?: 'wrong' | 'limited' }> {
  const ip = await clientIp();
  if (isRateLimited(ip)) return { error: 'limited' };
  const password = String(formData.get('password') ?? '');
  if (!password || !verifyPassword(password)) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 600));
    return { error: isRateLimited(ip) ? 'limited' : 'wrong' };
  }
  clearFailures(ip);
  await startSession();
  redirect('/');
}

export async function logout() {
  await endSession();
  redirect('/login');
}

export async function setUiLang(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(UI_LANG_COOKIE, lang, { path: '/', maxAge: 365 * 24 * 3600, sameSite: 'lax' });
  revalidatePath('/', 'layout');
}

export async function saveEntry(input: {
  type: string;
  documentId?: string;
  locale?: string;
  data: Record<string, unknown>;
  publish: boolean;
}): Promise<ActionResult> {
  return guard(async () => {
    const type = resolveType(input.type);
    const locale = resolveLocale(type, input.locale);
    const { data, errors } = cleanData(type, input.data ?? {});
    if (Object.keys(errors).length) return fail('validation', errors);

    let documentId = input.documentId;
    if (documentId) {
      await panel.update(type.key, documentId, locale, data);
    } else {
      if (type.sortable) {
        // Highest number: newest blog post goes first ("desc"), new team member/course goes last ("asc").
        const existing = await panel.list(type.key, locale);
        data.sortOrder = Math.max(0, ...existing.map((e) => Number(e.sortOrder ?? 0))) + 1;
      }
      documentId = (await panel.create(type.key, locale, data)).documentId;
    }
    if (input.publish) await panel.action(type.key, documentId, 'publish', locale);
    refresh(type.key);
    return { ok: true, documentId };
  });
}

export async function entryAction(input: { type: string; documentId: string; locale?: string; action: 'publish' | 'unpublish' | 'discard' }) {
  return guard(async () => {
    const type = resolveType(input.type);
    if (!['publish', 'unpublish', 'discard'].includes(input.action)) return fail('invalid');
    await panel.action(type.key, input.documentId, input.action, resolveLocale(type, input.locale));
    refresh(type.key);
    return { ok: true };
  });
}

export async function deleteEntry(input: { type: string; documentId: string; locale?: string }) {
  return guard(async () => {
    const type = resolveType(input.type);
    await panel.remove(type.key, input.documentId, type.localized ? resolveLocale(type, input.locale) : undefined);
    refresh(type.key);
    return { ok: true };
  });
}

export async function linkTranslation(input: { type: string; documentId: string; locale: string; sourceDocumentId: string }) {
  return guard(async () => {
    const type = resolveType(input.type);
    const locale = resolveLocale(type, input.locale);
    if (!locale) return fail('invalid');
    await panel.link(type.key, input.documentId, locale, input.sourceDocumentId);
    refresh(type.key);
    return { ok: true };
  });
}

export async function reorderEntries(input: { type: string; locale?: string; documentIds: string[]; allLanguages: boolean }) {
  return guard(async () => {
    const type = resolveType(input.type);
    if (!type.sortable) return fail('invalid');
    const n = input.documentIds.length;
    const items = input.documentIds.map((documentId, i) => ({ documentId, sortOrder: type.sortable === 'desc' ? n - i : i + 1 }));
    await panel.reorder(type.key, input.allLanguages ? '*' : resolveLocale(type, input.locale)!, items);
    refresh(type.key);
    return { ok: true };
  });
}

export async function deleteMedia(id: number) {
  return guard(async () => {
    await media.remove(id);
    revalidatePath('/media');
    return { ok: true };
  });
}

export async function deleteSubmission(input: { kind: string; documentId: string }) {
  return guard(async () => {
    const kind = getSubmissionType(input.kind);
    if (!kind) return fail('invalid');
    await panel.remove(kind.key, input.documentId, undefined);
    revalidatePath(`/submissions/${kind.key}`);
    revalidatePath('/');
    return { ok: true };
  });
}
