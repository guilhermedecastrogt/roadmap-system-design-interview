import { type Locale } from '@/i18n/routing';
import { TwRequirements } from './TwRequirements';
import { TwArchitectureMap } from './TwArchitectureMap';
import { TwWritePath } from './TwWritePath';
import { TwTimeline } from './TwTimeline';
import { TwMediaFlow } from './TwMediaFlow';
import { TwSearchFlow } from './TwSearchFlow';

/**
 * The full interactive "Architecting Twitter" lesson — a guided tour of a
 * Twitter-like architecture built from Redis, MongoDB, Kafka, Elasticsearch,
 * and S3. The learner frames the requirements, traces a request through the
 * layered service map (tapping each store to see why it was chosen), then
 * drives the four signature flows: posting a tweet (write path + Kafka fanout),
 * loading a home timeline (Redis hit/miss + fanout-on-write vs -on-read),
 * uploading media (S3 + CDN), and searching (Elasticsearch).
 */
export function TwLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <TwRequirements locale={locale} />
      <TwArchitectureMap locale={locale} />
      <TwWritePath locale={locale} />
      <TwTimeline locale={locale} />
      <TwMediaFlow locale={locale} />
      <TwSearchFlow locale={locale} />
    </div>
  );
}
