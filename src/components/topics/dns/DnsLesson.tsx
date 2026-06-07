import { type Locale } from '@/i18n/routing';
import { DnsExperience } from './DnsExperience';
import { DnsComparison } from './DnsComparison';
import { CacheTtlSim } from './CacheTtlSim';

/**
 * The full interactive DNS lesson, mounted by the topic page above the
 * Markdown prose. Composes the three interactive blocks; each future topic can
 * provide its own `*Lesson` and register it in `components/topics/registry`.
 */
export function DnsLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <DnsExperience locale={locale} />
      <DnsComparison locale={locale} />
      <CacheTtlSim locale={locale} />
    </div>
  );
}
