'use client';

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { type GlossaryEntry } from '@/content/schema';
import { cn } from '@/lib/utils';

/**
 * Flip-card glossary. Reusable across every topic — pass the frontmatter
 * `glossary` array. Cards flip on hover (desktop) or tap (touch).
 */
export function InteractiveGlossary({ entries }: { entries: GlossaryEntry[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setFlipped((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="not-prose grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, i) => (
        <button
          key={entry.term}
          type="button"
          onClick={() => toggle(i)}
          className="group h-36 text-left [perspective:1200px]"
          aria-label={entry.term}
        >
          <div
            className={cn(
              'relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]',
              flipped.has(i) && '[transform:rotateY(180deg)]',
            )}
          >
            {/* Front */}
            <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
                <Lightbulb className="h-[1.1rem] w-[1.1rem]" aria-hidden />
              </span>
              <div>
                <h4 className="font-display text-base font-semibold text-fg">
                  {entry.term}
                </h4>
                <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                  tap / hover
                </p>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 flex items-center rounded-2xl border border-accent/40 bg-accent/[0.06] p-4 [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
              <p className="text-sm leading-relaxed text-fg/85">{entry.definition}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
