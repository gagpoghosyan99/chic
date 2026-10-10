import { notFound } from 'next/navigation';
import { getSubmissionType } from '@/lib/content-types';
import { panel } from '@/lib/strapi';
import { getT } from '@/lib/ui-lang';
import { SubmissionsTable } from '@/components/submissions/SubmissionsTable';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const type = getSubmissionType(kind);
  if (!type) notFound();
  const { lang } = await getT();
  const entries = await panel.list(type.key);
  const rows = entries
    .map((e) => ({
      documentId: e.documentId,
      createdAt: e.createdAt,
      values: Object.fromEntries(type.columns.map((c) => [c.name, e[c.name] == null ? '' : String(e[c.name])])),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <h1 className="text-2xl font-semibold">{type.label[lang]}</h1>
      <SubmissionsTable kind={type.key} rows={rows} />
    </div>
  );
}
