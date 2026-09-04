import { type ComponentType } from 'react';
import { type Locale } from '@/i18n/routing';
import { DnsLesson } from './dns/DnsLesson';
import { CdnLesson } from './cdn/CdnLesson';
import { LbLesson } from './load-balancer/LbLesson';
import { CacheLesson } from './caching/CacheLesson';
import { MqLesson } from './message-queue/MqLesson';
import { RlLesson } from './rate-limiting/RlLesson';
import { GwLesson } from './api-gateway/GwLesson';
import { DbLesson } from './databases/DbLesson';
import { CapLesson } from './cap-theorem/CapLesson';
import { DsLesson } from './data-storage/DsLesson';
import { TwLesson } from './architecting-twitter/TwLesson';
import { ApiOverviewLesson } from './what-is-an-api/ApiOverviewLesson';
import { RestLesson } from './rest-api/RestLesson';
import { WhLesson } from './webhooks/WhLesson';
import { GqlLesson } from './graphql/GqlLesson';

/**
 * Maps a topic slug to an optional interactive experience rendered above the
 * Markdown prose on its topic page. Add new topics here as they get an
 * interactive lesson.
 */
export const topicExperiences: Record<string, ComponentType<{ locale: Locale }>> = {
  dns: DnsLesson,
  cdn: CdnLesson,
  'load-balancer': LbLesson,
  caching: CacheLesson,
  'message-queue': MqLesson,
  'rate-limiting-throttling': RlLesson,
  'api-gateway': GwLesson,
  'what-is-an-api': ApiOverviewLesson,
  'rest-api': RestLesson,
  webhooks: WhLesson,
  graphql: GqlLesson,
  databases: DbLesson,
  'cap-theorem': CapLesson,
  'data-storage': DsLesson,
  'architecting-twitter': TwLesson,
};
