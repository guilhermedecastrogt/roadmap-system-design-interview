import { type Locale } from '@/i18n/routing';
import { MqThroughputLab } from './MqThroughputLab';
import { MqImageFlow } from './MqImageFlow';
import { MqFanout } from './MqFanout';
import { MqDeliveryDlq } from './MqDeliveryDlq';

/**
 * The full interactive Message Queue lesson — an "async systems lab": a
 * throughput/buffering simulation (producer faster than consumer, queue depth
 * rising and draining), the image-processing flow (bucket + pointer), fan-out
 * with an isolated failing consumer, and the delivery-semantics + retry/DLQ
 * visualization.
 */
export function MqLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <MqThroughputLab locale={locale} />
      <MqImageFlow locale={locale} />
      <MqFanout locale={locale} />
      <MqDeliveryDlq locale={locale} />
    </div>
  );
}
