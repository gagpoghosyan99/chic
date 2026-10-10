'use client';

import { useActionState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '../actions';
import { useT } from '@/components/I18n';
import { UiLangSwitcher } from '@/components/UiLangSwitcher';

export default function LoginPage() {
  const t = useT();
  const [state, action, pending] = useActionState(login, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand to-brand-dark p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <img src="/logo.png" alt="CHIC" className="h-16 w-auto" />
        </div>
        <form action={action} className="card space-y-4 p-6">
          <h1 className="text-center text-lg font-semibold">{t('login.title')}</h1>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">{t('login.password')}</span>
            <input name="password" type="password" required autoFocus autoComplete="current-password" className="input" />
          </label>
          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{t(state.error === 'limited' ? 'login.tooMany' : 'login.error')}</p>
          )}
          <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
            <Lock className="size-4" />
            {t('login.submit')}
          </button>
        </form>
        <div className="mt-4 flex justify-center">
          <UiLangSwitcher dark />
        </div>
      </div>
    </main>
  );
}
