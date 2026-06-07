'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type Step = { title: string; text: string };

/**
 * Vertical, clickable timeline that stays in sync with a FlowDiagram. The
 * active step is highlighted and its description expands. Reusable across
 * topics — pass any ordered list of steps.
 */
export function Stepper({
  steps,
  activeIndex,
  onSelect,
}: {
  steps: Step[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <ol className="relative space-y-1">
      {/* rail */}
      <span className="absolute bottom-3 left-[0.6875rem] top-3 w-px bg-border" aria-hidden />

      {steps.map((step, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <li key={i} className="relative">
            <button
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                isActive ? 'bg-accent/[0.07]' : 'hover:bg-surface-2',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={cn(
                  'relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[0.7rem] font-semibold transition-colors',
                  isActive
                    ? 'border-accent bg-accent text-accent-fg'
                    : isDone
                      ? 'border-accent/50 bg-accent/15 text-accent'
                      : 'border-border bg-surface text-muted',
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-sm font-semibold transition-colors',
                    isActive ? 'text-fg' : isDone ? 'text-fg/80' : 'text-muted',
                  )}
                >
                  {step.title}
                </span>
                <motion.span
                  initial={false}
                  animate={{
                    height: isActive ? 'auto' : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ duration: 0.25 }}
                  className="block overflow-hidden text-sm leading-relaxed text-muted"
                >
                  <span className="block pt-1">{step.text}</span>
                </motion.span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
