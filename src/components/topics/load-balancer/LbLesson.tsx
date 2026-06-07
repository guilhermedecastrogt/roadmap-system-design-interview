import { type Locale } from '@/i18n/routing';
import { CompareTwo } from '../_shared/CompareTwo';
import { lbContent } from './content';
import { LbSimulator } from './LbSimulator';
import { LbArchitecture } from './LbArchitecture';

/**
 * The full interactive Load Balancer lesson: a live traffic-control lab (the
 * "how"), where balancers live in real systems, then the key comparisons
 * (static/dynamic, stateful/stateless, L4/L7).
 */
export function LbLesson({ locale }: { locale: Locale }) {
  const c = lbContent[locale];
  return (
    <div className="space-y-14">
      <LbSimulator locale={locale} />
      <LbArchitecture locale={locale} />
      <CompareTwo data={c.staticDynamic} />
      <CompareTwo data={c.statefulStateless} />
      <CompareTwo data={c.l4l7} />
    </div>
  );
}
