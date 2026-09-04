import { type Locale } from '@/i18n/routing';
import { ApiCommunicationMap } from '../api-track/ApiCommunicationMap';
import { ApiTrackNav } from '../api-track/ApiTrackNav';
import { RestPlayground } from './RestPlayground';
import { RestResourceMap } from './RestResourceMap';
import { RestCollections } from './RestCollections';

/**
 * The REST lesson: send real-shaped calls and watch where each status code is
 * produced, read the resource map with its safe/idempotent promises, then build
 * a collection URL and page through it.
 */
export function RestLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <RestPlayground locale={locale} />
      <RestResourceMap locale={locale} />
      <RestCollections locale={locale} />
      <ApiCommunicationMap locale={locale} current="rest" />
      <ApiTrackNav locale={locale} current="rest" />
    </div>
  );
}
