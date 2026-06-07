import { type Locale } from '@/i18n/routing';
import { CdnLatencyLab } from './CdnLatencyLab';
import { CdnExperience } from './CdnExperience';
import { PushPullViz } from './PushPullViz';
import { CdnTopology } from './CdnTopology';

/**
 * The full interactive CDN lesson: a latency lab (the "why"), the core request
 * flow (the "how"), then push/pull and topology trade-offs. Reuses the shared
 * FlowPlayer engine plus CDN-specific scene visualizations.
 */
export function CdnLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <CdnLatencyLab locale={locale} />
      <CdnExperience locale={locale} />
      <PushPullViz locale={locale} />
      <CdnTopology locale={locale} />
    </div>
  );
}
