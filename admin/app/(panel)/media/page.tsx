import { MediaLibrary } from '@/components/media/MediaLibrary';
import { getT } from '@/lib/ui-lang';

export default async function MediaPage() {
  const { t } = await getT();
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <h1 className="text-2xl font-semibold">{t('media.title')}</h1>
      <MediaLibrary />
    </div>
  );
}
