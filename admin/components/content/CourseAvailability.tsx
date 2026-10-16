'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { setCourseAvailability } from '@/app/actions';
import { useT } from '../I18n';
import { useConfirm } from '../ui/Confirm';
import { useToast } from '../ui/Toast';

/** One control that opens or closes registration for every language of a course. */
export function CourseAvailability({
  documentId,
  available,
  compact,
}: {
  documentId: string;
  available: boolean;
  /** Smaller control for the course list row. */
  compact?: boolean;
}) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [busy, startBusy] = useTransition();
  const next = !available;

  const apply = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!(await confirm(t(next ? 'course.confirmOpen' : 'course.confirmClose')))) return;
    startBusy(async () => {
      const res = await setCourseAvailability({ documentId, available: next });
      if (!res.ok) return toast('error', t('errorGeneric'));
      toast('success', t(next ? 'toast.registrationOpen' : 'toast.registrationClosed'));
      router.refresh();
    });
  };

  if (compact) {
    return (
      <>
        <button
          type="button"
          disabled={busy}
          onClick={apply}
          title={t(available ? 'course.closeAll' : 'course.openAll')}
          className={`shrink-0 rounded px-1.5 text-xs font-medium transition hover:ring-2 hover:ring-offset-1 disabled:opacity-50 ${
            available ? 'bg-emerald-50 text-emerald-700 hover:ring-emerald-300' : 'bg-slate-100 text-slate-500 hover:ring-slate-300'
          }`}
        >
          {t(available ? 'course.open' : 'course.closed')}
        </button>
        {dialog}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="font-medium text-slate-900">{t(available ? 'course.open' : 'course.closed')}</p>
          <p className="text-sm text-slate-500">{t('course.sharedHelp')}</p>
        </div>
        <button type="button" disabled={busy} onClick={apply} className={available ? 'btn-secondary' : 'btn-primary'}>
          {available ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
          {t(available ? 'course.closeAll' : 'course.openAll')}
        </button>
      </div>
      {dialog}
    </>
  );
}
