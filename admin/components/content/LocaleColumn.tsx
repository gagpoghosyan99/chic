'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Copy, Eye, ExternalLink, Link2, MoreHorizontal, Plus, Rocket, Save, Trash2, Undo2, EyeOff } from 'lucide-react';
import { deleteEntry, entryAction, linkTranslation, saveEntry } from '@/app/actions';
import { getContentType } from '@/lib/content-types';
import { LANG_NAMES, type Lang } from '@/lib/i18n';
import type { FormValues, Version } from '@/lib/editor-data';
import type { MediaValue } from '@/lib/media-types';
import { useLabel, useT } from '../I18n';
import { StatusBadge } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';
import { FieldInput } from './FieldInput';
import { Preview } from './Preview';
import type { Candidate } from './Editor';

function serialize(values: FormValues) {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    data[k] = v && typeof v === 'object' && !Array.isArray(v) && 'id' in (v as object) ? (v as MediaValue).id : v;
  }
  return data;
}

export function LocaleColumn({
  typeKey,
  documentId,
  locale,
  version,
  empty,
  others,
  candidates,
  siteUrl,
  isOnlyVersion,
  onDirty,
}: {
  typeKey: string;
  documentId: string | null;
  locale: Lang | undefined;
  version: Version | undefined;
  empty: FormValues;
  others: { lang: Lang; values: FormValues }[];
  candidates: Candidate[];
  siteUrl: string;
  isOnlyVersion: boolean;
  onDirty: (key: string, dirty: boolean) => void;
}) {
  const type = getContentType(typeKey)!;
  const t = useT();
  const label = useLabel();
  const toast = useToast();
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [values, setValues] = useState<FormValues>(version?.values ?? empty);
  const [creating, setCreating] = useState(!documentId);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, startBusy] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [linkTarget, setLinkTarget] = useState('');
  const key = locale ?? 'default';
  const langName = locale ? LANG_NAMES[locale] : '';

  useEffect(() => onDirty(key, dirty), [key, dirty, onDirty]);

  const setField = (name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
    setDirty(true);
  };

  const errorText = (code: string) => (code === 'url' ? t('editor.invalidUrl') : code ? t('editor.required') : '');

  const save = (publish: boolean) =>
    startBusy(async () => {
      const res = await saveEntry({ type: type.key, documentId: documentId ?? undefined, locale, data: serialize(values), publish });
      if (!res.ok) {
        if (res.fields) setErrors(res.fields);
        toast('error', res.error === 'validation' ? t('editor.required') : `${t('errorGeneric')}: ${res.error}`);
        return;
      }
      setDirty(false);
      onDirty(key, false);
      toast('success', t(publish ? 'toast.published' : 'toast.saved'));
      if (!documentId && res.documentId) router.replace(`/content/${type.key}/${res.documentId}?lang=${locale ?? 'hy'}`);
      else router.refresh();
    });

  const confirmAndRun = async (question: string, action: 'unpublish' | 'discard', message: Parameters<typeof t>[0]) => {
    setMenuOpen(false);
    if (await confirm(question)) run(action, message);
  };

  const run = (action: 'publish' | 'unpublish' | 'discard', message: Parameters<typeof t>[0]) =>
    startBusy(async () => {
      const res = await entryAction({ type: type.key, documentId: documentId!, locale, action });
      if (!res.ok) return toast('error', t('errorGeneric'));
      toast('success', t(message));
      if (action === 'discard') window.location.reload();
      else router.refresh();
    });

  const remove = async () => {
    setMenuOpen(false);
    if (!(await confirm(t('editor.confirmDeleteLang', { lang: langName || label(type.label) }), { danger: true, confirmLabel: t('delete') }))) return;
    startBusy(async () => {
      const res = await deleteEntry({ type: type.key, documentId: documentId!, locale });
      if (!res.ok) return toast('error', t('errorGeneric'));
      toast('success', t('toast.deleted'));
      setDirty(false);
      onDirty(key, false);
      if (isOnlyVersion) router.push(type.single ? '/' : `/content/${type.key}?lang=${locale ?? 'hy'}`);
      else router.refresh();
    });
  };

  const link = () =>
    startBusy(async () => {
      const res = await linkTranslation({ type: type.key, documentId: documentId!, locale: locale!, sourceDocumentId: linkTarget });
      if (!res.ok) return toast('error', `${t('errorGeneric')}: ${res.error}`);
      toast('success', t('toast.linked'));
      window.location.reload();
    });

  if (!version && !creating) {
    return (
      <section className="card space-y-4 border-dashed p-5">
        <h2 className="font-semibold">{langName}</h2>
        <p className="text-sm text-slate-600">{t('editor.missingLang', { lang: langName })}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> {t('editor.createTranslation')}
          </button>
          {others.map((o) => (
            <button
              key={o.lang}
              type="button"
              className="btn-secondary"
              onClick={() => {
                setValues({ ...o.values });
                setCreating(true);
                setDirty(true);
              }}
            >
              <Copy className="size-4" /> {t('editor.copyFrom', { lang: LANG_NAMES[o.lang] })}
            </button>
          ))}
        </div>
        {candidates.length > 0 && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Link2 className="size-4" /> {t('editor.linkExisting')}
            </p>
            <p className="text-sm text-slate-500">{t('editor.linkHelp', { lang: langName })}</p>
            <div className="flex gap-2">
              <select value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)} className="input">
                <option value="">{t('editor.linkPlaceholder')}</option>
                {candidates.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.title}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-secondary" disabled={!linkTarget || busy} onClick={link}>
                {t('editor.link')}
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  const status = version?.status ?? 'draft';
  const siteHref = type.sitePath && documentId && locale && status !== 'draft' ? `${siteUrl}${type.sitePath(locale, documentId)}` : null;

  return (
    <section className="card flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <h2 className="font-semibold">{langName || label(type.label)}</h2>
        <div className="flex items-center gap-2">
          {version ? <StatusBadge status={status} /> : <span className="text-xs text-slate-400">{t('editor.newTitle')}</span>}
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((o) => !o)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="More">
              <MoreHorizontal className="size-5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                  <MenuItem icon={Eye} onClick={() => (setMenuOpen(false), setPreview(true))}>
                    {t('preview')}
                  </MenuItem>
                  {siteHref && (
                    <MenuItem icon={ExternalLink} href={siteHref}>
                      {t('viewOnSite')}
                    </MenuItem>
                  )}
                  {version && status === 'modified' && (
                    <MenuItem icon={Undo2} onClick={() => confirmAndRun(t('editor.confirmDiscard'), 'discard', 'toast.discarded')}>
                      {t('discard')}
                    </MenuItem>
                  )}
                  {version && status !== 'draft' && (
                    <MenuItem icon={EyeOff} onClick={() => confirmAndRun(t('editor.confirmUnpublish'), 'unpublish', 'toast.unpublished')}>
                      {t('unpublish')}
                    </MenuItem>
                  )}
                  {version && (
                    <MenuItem icon={Trash2} danger onClick={remove}>
                      {locale ? t('editor.deleteLang') : t('delete')}
                    </MenuItem>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-4">
        {type.fields.map((field) => (
          <FieldInput key={field.name} field={field} value={values[field.name]} onChange={(v) => setField(field.name, v)} error={errorText(errors[field.name] ?? '')} />
        ))}
      </div>

      <div className="sticky bottom-0 mt-auto flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur">
        <button type="button" className="btn-ghost mr-auto" onClick={() => setPreview(true)}>
          <Eye className="size-4" /> {t('preview')}
        </button>
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => save(false)}>
          <Save className="size-4" /> {t('saveDraft')}
        </button>
        <button type="button" className="btn-primary" disabled={busy} onClick={() => save(true)}>
          <Rocket className="size-4" /> {t('publish')}
        </button>
      </div>

      <Preview open={preview} onClose={() => setPreview(false)} typeKey={type.key} values={values} locale={locale ?? 'hy'} />
      {dialog}
    </section>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  href,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const cls = `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${danger ? 'text-red-700 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100'}`;
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        <Icon className="size-4" /> {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      <Icon className="size-4" /> {children}
    </button>
  );
}
