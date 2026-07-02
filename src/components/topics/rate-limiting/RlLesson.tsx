import { type Locale } from '@/i18n/routing';
import { RlTrafficSim } from './RlTrafficSim';
import { RlNoLimitVsLimit } from './RlNoLimitVsLimit';
import { RlDimensions } from './RlDimensions';
import { RlAlgorithms } from './RlAlgorithms';
import { RlPlacement } from './RlPlacement';

/**
 * The full interactive Rate Limiting lesson — a "traffic control lab": send a
 * stream of requests and watch the limiter allow/block them, compare a server
 * with and without a limit under a flood, see what key a limit counts against,
 * step through the four classic algorithms (fixed/sliding window, token/leaky
 * bucket), and explore where in the stack a limit can live.
 */
export function RlLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <RlTrafficSim locale={locale} />
      <RlNoLimitVsLimit locale={locale} />
      <RlDimensions locale={locale} />
      <RlAlgorithms locale={locale} />
      <RlPlacement locale={locale} />
    </div>
  );
}
