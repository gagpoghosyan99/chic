import { requireSession } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <div className="flex min-h-screen">
      <Sidebar siteUrl={process.env.SITE_URL ?? 'https://chic.ngo'} />
      <main className="min-w-0 flex-1 px-4 pt-16 pb-6 lg:px-8 lg:pt-6">{children}</main>
    </div>
  );
}
