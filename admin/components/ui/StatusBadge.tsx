'use client';

import { useT } from '../I18n';

const STYLES = {
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  draft: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  modified: 'bg-amber-50 text-amber-800 ring-amber-600/30',
} as const;

const DOTS = { published: 'bg-emerald-500', draft: 'bg-slate-400', modified: 'bg-amber-500' } as const;

export function StatusBadge({ status }: { status: keyof typeof STYLES }) {
  const t = useT();
  return (
    <span
      title={t(`statusHelp.${status}`)}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className={`size-1.5 rounded-full ${DOTS[status]}`} />
      {t(`status.${status}`)}
    </span>
  );
}
