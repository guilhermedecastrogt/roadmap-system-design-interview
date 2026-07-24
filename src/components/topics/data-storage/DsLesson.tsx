import { type Locale } from '@/i18n/routing';
import { DsFitMatrix } from './DsFitMatrix';
import { DsExplorer } from './DsExplorer';
import { DsUploadLab } from './DsUploadLab';

/**
 * The full interactive Data Storage lesson — a storage architecture lab:
 * match each kind of data (records, photos, 4K video, logs) to the store
 * that fits it, flip the same files between a hierarchical file system and a
 * flat object-storage bucket (opening each object's data + metadata + ID),
 * then upload a file and serve it worldwide with and without a CDN.
 */
export function DsLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <DsFitMatrix locale={locale} />
      <DsExplorer locale={locale} />
      <DsUploadLab locale={locale} />
    </div>
  );
}
