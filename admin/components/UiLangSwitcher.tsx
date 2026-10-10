'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setUiLang } from '@/app/actions';
import { LANGS, LANG_NAMES } from '@/lib/i18n';
import { useT, useUiLang } from './I18n';

export function UiLangSwitcher({ dark }: { dark?: boolean }) {
  const current = useUiLang();
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div role="group" aria-label={t('uiLanguage')} className={`inline-flex rounded-lg p-0.5 text-xs ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          disabled={pending}
          onClick={() => start(async () => {
            await setUiLang(lang);
            router.refresh();
          })}
          className={`rounded-md px-2.5 py-1 font-medium transition ${
            lang === current ? (dark ? 'bg-white text-brand' : 'bg-white text-slate-900 shadow-sm') : dark ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {LANG_NAMES[lang]}
        </button>
      ))}
    </div>
  );
}
