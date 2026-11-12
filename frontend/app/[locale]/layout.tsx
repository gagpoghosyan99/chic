import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Noto_Serif, Noto_Serif_Armenian } from 'next/font/google';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import '../globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-noto-serif',
});

const notoSerifArmenian = Noto_Serif_Armenian({
  subsets: ['armenian'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-serif-armenian',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: 'CHIC - Center for Joint Healthcare Innovations NGO',
    description: 'Center for Joint Healthcare Innovations NGO',
    icons: {
      icon: '/collab-white.png',
      shortcut: '/collab-white.png',
      apple: '/collab-white.png',
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${notoSerif.variable} ${notoSerifArmenian.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
