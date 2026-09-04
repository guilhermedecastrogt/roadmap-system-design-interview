import { type Locale } from '@/i18n/routing';
import { ApiCommunicationMap } from '../api-track/ApiCommunicationMap';
import { ApiTrackNav } from '../api-track/ApiTrackNav';
import { GqlQueryBuilder } from './GqlQueryBuilder';
import { GqlFetchCompare } from './GqlFetchCompare';
import { GqlSchema } from './GqlSchema';
import { GqlComplexityGuard } from './GqlComplexityGuard';

/**
 * The GraphQL lesson: build a query field by field, compare the same screen
 * fetched three ways, look at the schema and the resolvers behind it, and see
 * why an endpoint that accepts any shape needs a cost budget.
 */
export function GqlLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <GqlQueryBuilder locale={locale} />
      <GqlFetchCompare locale={locale} />
      <GqlSchema locale={locale} />
      <GqlComplexityGuard locale={locale} />
      <ApiCommunicationMap locale={locale} current="graphql" />
      <ApiTrackNav locale={locale} current="graphql" />
    </div>
  );
}
