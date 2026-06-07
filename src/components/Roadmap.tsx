import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type RoadmapStage } from '@/content/topics';
import { stagesById } from '@/content/stages';
import { type Locale } from '@/i18n/routing';
import { DifficultyBadge, StatusBadge } from './Badges';
import { cn } from '@/lib/utils';

/**
 * The roadmap is rendered entirely from topic metadata (`getRoadmap`).
 * Adding a topic file automatically places a node on the correct stage —
 * nothing here is hardcoded except the stage labels (from `stages.ts`).
 */
export function Roadmap({
  roadmap,
  locale,
}: {
  roadmap: RoadmapStage[];
  locale: Locale;
}) {
  const t = useTranslations('Home');

  return (
    <ol className="relative space-y-14">
      {roadmap.map((stage, stageIndex) => {
        const meta = stagesById[stage.id];
        return (
          <li key={stage.id} className="relative pl-10 sm:pl-14">
            {/* Vertical spine — connects the stage markers. */}
            {stageIndex < roadmap.length - 1 && (
              <span
                className="absolute left-[15px] top-9 -bottom-14 w-px bg-gradient-to-b from-border to-border/40 sm:left-[19px]"
                aria-hidden
              />
            )}

            {/* Stage marker */}
            <div
              className="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-xs font-semibold text-accent sm:h-10 sm:w-10 sm:text-sm"
              aria-hidden
            >
              {stageIndex + 1}
            </div>

            <div className="space-y-4">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight text-fg sm:text-xl">
                  {meta.label[locale]}
                </h3>
                <p className="max-w-2xl text-sm text-muted">
                  {meta.description[locale]}
                </p>
              </header>

              {stage.topics.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted">
                  {t('emptyStage')}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {stage.topics.map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`/topics/${topic.slug}`}
                      className={cn(
                        'group relative flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-all',
                        'hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-medium leading-snug text-fg">
                          {topic.title}
                        </h4>
                        <ArrowRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                          aria-hidden
                        />
                      </div>
                      <p className="line-clamp-2 text-sm text-muted">
                        {topic.description}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                        <DifficultyBadge value={topic.difficulty} />
                        <StatusBadge value={topic.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
