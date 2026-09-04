import { type Locale } from '@/i18n/routing';
import { ApiCommunicationMap } from '../api-track/ApiCommunicationMap';
import { ApiStyleCompare } from '../api-track/ApiStyleCompare';
import { ApiTrackNav } from '../api-track/ApiTrackNav';
import { ApiJourney } from './ApiJourney';
import { ApiAnatomy } from './ApiAnatomy';
import { ApiAudiences } from './ApiAudiences';

/**
 * "What is an API?" — the hub of the API communication track. It teaches the
 * contract itself (one request making the full round trip, the anatomy of that
 * exchange, who is allowed to call it) and then hands the reader off to the
 * three specialized lessons through the shared map and comparison.
 */
export function ApiOverviewLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <ApiJourney locale={locale} />
      <ApiAnatomy locale={locale} />
      <ApiAudiences locale={locale} />
      <ApiCommunicationMap locale={locale} current="overview" />
      <ApiStyleCompare locale={locale} />
      <ApiTrackNav locale={locale} current="overview" />
    </div>
  );
}
