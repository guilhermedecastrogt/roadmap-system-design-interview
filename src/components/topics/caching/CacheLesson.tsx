import { type Locale } from '@/i18n/routing';
import { CompareTwo } from '../_shared/CompareTwo';
import { cacheContent } from './content';
import { CacheLab } from './CacheLab';
import { CacheLayers } from './CacheLayers';
import { CacheStrategies } from './CacheStrategies';
import { CacheDoDont } from './CacheDoDont';

/**
 * The full interactive Cache lesson: a performance lab (latency + hit/miss),
 * where caches live, the cache-aside / read-through / write-through strategy
 * flows, their summary comparison, and what to cache vs not.
 */
export function CacheLesson({ locale }: { locale: Locale }) {
  const c = cacheContent[locale];
  return (
    <div className="space-y-14">
      <CacheLab locale={locale} />
      <CacheLayers locale={locale} />
      <CacheStrategies locale={locale} />
      <CompareTwo data={c.compare} />
      <CacheDoDont locale={locale} />
    </div>
  );
}
