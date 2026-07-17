import { type Locale } from '@/i18n/routing';
import { DbDecisionMap } from './DbDecisionMap';
import { DbSqlVsNosql } from './DbSqlVsNosql';
import { DbTypeExplorer } from './DbTypeExplorer';
import { DbPolyglot } from './DbPolyglot';
import { DbMultiRegion } from './DbMultiRegion';

/**
 * The full interactive Database lesson — a "database decision lab": walk a
 * requirements decision tree and watch the candidate map narrow, flip an
 * honest SQL vs NoSQL comparison (with myth-busting), tour the eight database
 * families, route features of one app to the stores that fit them, and feel
 * the eventual-vs-strong consistency trade-off across two regions.
 */
export function DbLesson({ locale }: { locale: Locale }) {
  return (
    <div className="space-y-14">
      <DbDecisionMap locale={locale} />
      <DbSqlVsNosql locale={locale} />
      <DbTypeExplorer locale={locale} />
      <DbPolyglot locale={locale} />
      <DbMultiRegion locale={locale} />
    </div>
  );
}
