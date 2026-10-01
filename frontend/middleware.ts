import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'hy',
  localePrefix: 'always',
  localeDetection: false // Always use default locale (hy) instead of detecting browser language
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

