'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { deleteSubmission } from '@/app/actions';
import { getSubmissionType } from '@/lib/content-types';
import { useLabel, useT, useUiLang } from '../I18n';
import { useConfirm } from '../ui/Confirm';
import { useToast } from '../ui/Toast';

type Row = { documentId: string; createdAt: string; values: Record<string, string> };

export function SubmissionsTable({ kind, rows }: { kind: string; rows: Row[] }) {
  const type = getSubmissionType(kind)!;
  const t = useT();
  const label = useLabel();
  const lang = useUiLang();
  const toast = useToast();
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [query, setQuery] = useState('');
  const [busy, start] = useTransition();

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(lang === 'hy' ? 'hy-AM' : lang === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
    [lang],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => Object.values(r.values).some((v) => v.toLowerCase().includes(q))) : rows;
  }, [rows, query]);

  const remove = async (documentId: string) => {
    if (!(await confirm(t('subs.confirmDelete'), { danger: true, confirmLabel: t('delete') }))) return;
    start(async () => {
      const res = await deleteSubmission({ kind, documentId });
      if (!res.ok) return toast('error', t('errorGeneric'));
      toast('success', t('toast.deleted'));
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {t('subs.privacy')}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder={t('search')} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <span className="text-sm text-slate-500">
          {filtered.length} {t('items')}
        </span>
        <a href={`/api/export/${kind}`} className="btn-primary" download>
          <Download className="size-4" /> {t('export')}
        </a>
      </div>

      {filtered.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">{t('subs.empty')}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">{t('subs.date')}</th>
                {type.columns.map((c) => (
                  <th key={c.name} className="px-4 py-3 font-medium">
                    {label(c.label)}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <tr key={row.documentId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">{dateFmt.format(new Date(row.createdAt))}</td>
                  {type.columns.map((c) => (
                    <td key={c.name} className="px-4 py-3">
                      {c.name === 'email' && row.values[c.name] ? (
                        <a href={`mailto:${row.values[c.name]}`} className="text-brand hover:underline">
                          {row.values[c.name]}
                        </a>
                      ) : c.name === 'phone' && row.values[c.name] ? (
                        <a href={`tel:${row.values[c.name].replace(/[^\d+]/g, '')}`} className="text-brand hover:underline">
                          {row.values[c.name]}
                        </a>
                      ) : (
                        row.values[c.name] || '—'
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(row.documentId)}
                      title={t('delete')}
                      aria-label={t('delete')}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog}
    </div>
  );
}
