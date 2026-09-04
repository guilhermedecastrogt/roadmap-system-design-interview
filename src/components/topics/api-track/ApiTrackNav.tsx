import { ArrowLeft, ArrowRight, Map } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { trackContent, type TrackNodeId } from './trackContent';

/**
 * Track navigation rendered at the end of every lesson: the four steps as a
 * progress rail, plus previous / hub / next links. The topic page already has
 * global prev/next; this one is scoped to the mini-track so the reader can move
 * inside it without leaving the page's context.
 */
export function ApiTrackNav({ locale, current }: { locale: Locale; current: TrackNodeId }) {
  const t = trackContent[locale];
  const steps = t.steps;
  const index = steps.findIndex((s) => s.id === current);
  const prev = index > 0 ? steps[index - 1] : null;
  const next = index < steps.length - 1 ? steps[index + 1] : null;
  const hub = steps[0];

  return (
    <nav className="not-prose rounded-2xl border border-border bg-surface/40 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest text-accent">
          {t.nav.trackLabel}
        </span>
        <span className="font-mono text-[0.65rem] text-muted">
          {t.nav.stepOf.replace('{n}', String(index + 1))}
        </span>
      </div>

      {/* progress rail */}
      <ol className="mt-3 grid gap-1.5 sm:grid-cols-4">
        {steps.map((s, i) => {
          const done = i < index;
          const isCurrent = i === index;
          const inner = (
            <>
              <span
                className={cn(
                  'font-mono text-[0.6rem]',
                  isCurrent ? 'text-accent' : done ? 'text-fg/60' : 'text-muted',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className={cn(
                  'block text-[0.78rem] font-semibold leading-tight',
                  isCurrent ? 'text-accent' : 'text-fg',
                )}
              >
                {s.label}
              </span>
              <span className="block text-[0.66rem] leading-tight text-muted">{s.tagline}</span>
            </>
          );
          return (
            <li key={s.id}>
              {isCurrent ? (
                <div className="rounded-xl border border-accent bg-accent/[0.07] px-3 py-2">
                  {inner}
                </div>
              ) : (
                <Link
                  href={`/topics/${s.slug}`}
                  className="block rounded-xl border border-border px-3 py-2 transition-colors hover:border-accent/40 hover:bg-surface-2/60"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* prev / hub / next */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        {prev ? (
          <Link
            href={`/topics/${prev.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t.nav.prev}: {prev.label}
          </Link>
        ) : (
          <span />
        )}

        {current !== 'overview' && (
          <Link
            href={`/topics/${hub.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-fg"
          >
            <Map className="h-3.5 w-3.5" aria-hidden />
            {t.nav.hub}
          </Link>
        )}

        {next ? (
          <Link
            href={`/topics/${next.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:underline"
          >
            {t.nav.next}: {next.label}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  );
}
