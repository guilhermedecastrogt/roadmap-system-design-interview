import { type ComponentType } from 'react';
import { type Locale } from '@/i18n/routing';
import { DnsLesson } from './dns/DnsLesson';
import { CdnLesson } from './cdn/CdnLesson';
import { LbLesson } from './load-balancer/LbLesson';
import { CacheLesson } from './caching/CacheLesson';
import { MqLesson } from './message-queue/MqLesson';

/**
 * Maps a topic slug to an optional interactive experience rendered above the
 * Markdown prose on its topic page. Add new topics here as they get an
 * interactive lesson (API Gateway, …).
 */
export const topicExperiences: Record<string, ComponentType<{ locale: Locale }>> = {
  dns: DnsLesson,
  cdn: CdnLesson,
  'load-balancer': LbLesson,
  caching: CacheLesson,
  'message-queue': MqLesson,
};
