import { type Locale } from '@/i18n/routing';
import { ApiCommunicationMap } from '../api-track/ApiCommunicationMap';
import { ApiTrackNav } from '../api-track/ApiTrackNav';
import { WhPollingVsWebhooks } from './WhPollingVsWebhooks';
import { WhDeliveryLab } from './WhDeliveryLab';
import { WhReceiverGuards } from './WhReceiverGuards';
import { WhNeighbours } from './WhNeighbours';

/**
 * The Webhooks lesson: why pushing beats asking, what a delivery actually looks
 * like when it fails, how to build a receiver that survives retries and
 * duplicates, and where webhooks sit next to APIs and queues.
 */
export function WhLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <WhPollingVsWebhooks locale={locale} />
      <WhDeliveryLab locale={locale} />
      <WhReceiverGuards locale={locale} />
      <WhNeighbours locale={locale} />
      <ApiCommunicationMap locale={locale} current="webhooks" />
      <ApiTrackNav locale={locale} current="webhooks" />
    </div>
  );
}
