import 'server-only';
import { cookies } from 'next/headers';
import { isLang, translate, type DictKey, type Lang } from './i18n';

export const UI_LANG_COOKIE = 'chic_admin_ui_lang';

export async function getUiLang(): Promise<Lang> {
  const value = (await cookies()).get(UI_LANG_COOKIE)?.value;
  return isLang(value) ? value : 'hy';
}

export async function getT() {
  const lang = await getUiLang();
  return { lang, t: (key: DictKey, vars?: Record<string, string | number>) => translate(lang, key, vars) };
}
