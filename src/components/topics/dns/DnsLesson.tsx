import { type Locale } from '@/i18n/routing';
import { DnsHero } from './DnsHero';
import { DnsAnatomy } from './DnsAnatomy';
import { DnsJourney } from './DnsJourney';
import { DnsCacheLab } from './DnsCacheLab';
import { DnsRecords } from './DnsRecords';

/**
 * The full interactive DNS lesson, mounted by the topic page above the
 * Markdown prose. Five acts: the phonebook idea, the anatomy of a name
 * (mind map), the journey of a lookup (animated flow), the cache & TTL lab,
 * and the record types.
 */
export function DnsLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-16">
      <DnsHero locale={locale} />
      <DnsAnatomy locale={locale} />
      <DnsJourney locale={locale} />
      <DnsCacheLab locale={locale} />
      <DnsRecords locale={locale} />
    </div>
  );
}
