'use client';

import { createContext, useCallback, useContext } from 'react';
import { translate, type DictKey, type L, type Lang } from '@/lib/i18n';

const I18nContext = createContext<Lang>('hy');

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>;
}

export function useUiLang() {
  return useContext(I18nContext);
}

export function useT() {
  const lang = useContext(I18nContext);
  return useCallback((key: DictKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
}

/** Picks the current interface language from a multilingual label. */
export function useLabel() {
  const lang = useContext(I18nContext);
  return useCallback((label: L) => label[lang], [lang]);
}
