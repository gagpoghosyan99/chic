import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/components/I18n';
import { ToastProvider } from '@/components/ui/Toast';
import { getUiLang } from '@/lib/ui-lang';

export const metadata: Metadata = {
  title: 'CHIC Admin',
  robots: { index: false, follow: false },
  icons: { icon: '/logo.png' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getUiLang();
  return (
    <html lang={lang}>
      <body>
        <I18nProvider lang={lang}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
