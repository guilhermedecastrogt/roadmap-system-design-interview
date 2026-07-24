import { type Locale } from '@/i18n/routing';
import { TwBlueprint } from './TwBlueprint';
import { TwRequirements } from './TwRequirements';
import { TwEstimations } from './TwEstimations';
import { TwArchitectureMap } from './TwArchitectureMap';
import { TwWritePath } from './TwWritePath';
import { TwTimeline } from './TwTimeline';
import { TwMediaFlow } from './TwMediaFlow';
import { TwSearchFlow } from './TwSearchFlow';
import { TwFailureSim } from './TwFailureSim';

/**
 * The full interactive "Architecting Twitter" lesson — a guided tour of a
 * Twitter-like architecture built from Redis, MongoDB, Kafka, Elasticsearch,
 * and S3. It opens with a fixed macro blueprint (the whole system on one page),
 * then the learner frames the requirements, sizes the system with a live
 * back-of-the-envelope calculator, traces a request through the layered service
 * map (tapping each store to see why it was chosen), then drives the signature
 * flows: posting a tweet (write path + Kafka fanout), loading a home timeline
 * (Redis hit/miss + fanout-on-write vs -on-read, with real-world usage),
 * uploading media (S3 + CDN), searching (Elasticsearch), and finally stress-
 * tests resilience with a failure simulator (Redis/Mongo/Kafka/region down).
 */
export function TwLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <TwBlueprint locale={locale} />
      <TwRequirements locale={locale} />
      <TwEstimations locale={locale} />
      <TwArchitectureMap locale={locale} />
      <TwWritePath locale={locale} />
      <TwTimeline locale={locale} />
      <TwMediaFlow locale={locale} />
      <TwSearchFlow locale={locale} />
      <TwFailureSim locale={locale} />
    </div>
  );
}
