'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, Lightbulb, RotateCcw, X } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { databaseContent, type DbTypeId, type DecisionQuestion } from './content';
import { DbHeading, DB_TYPE_ICONS, DB_TYPE_TEXT } from './DbKit';

type Answer = { questionId: string; answer: 'yes' | 'no' };

/**
 * The decision lab: answer requirement questions one at a time and watch the
 * candidate map narrow — eliminated families dim, and the final fit lights up
 * with a why + caveat card. Clicking a breadcrumb rewinds to that answer.
 */
export function DbDecisionMap({ locale }: { locale: Locale }) {
  const c = databaseContent[locale];
  const t = c.decision;
  const types = c.explorer.types;

  const [answers, setAnswers] = useState<Answer[]>([]);

  const questionById = useMemo(() => {
    const map = new Map<string, DecisionQuestion>();
    for (const q of t.questions) map.set(q.id, q);
    return map;
  }, [t.questions]);

  // Replay the answers to derive the eliminated set, current question, result.
  const { eliminated, currentId, result } = useMemo(() => {
    const gone = new Set<DbTypeId>();
    let current: string | null = t.firstQuestion;
    let res: DbTypeId | null = null;

    for (const a of answers) {
      const q = questionById.get(a.questionId);
      if (!q) break;
      const outcome = a.answer === 'yes' ? q.yes : q.no;
      for (const e of outcome.eliminate ?? []) gone.add(e);
      if (outcome.result) {
        res = outcome.result;
        current = null;
        break;
      }
      current = outcome.next ?? null;
    }

    if (res) {
      for (const type of types) if (type.id !== res) gone.add(type.id);
    }
    return { eliminated: gone, currentId: current, result: res };
  }, [answers, questionById, t.firstQuestion, types]);

  const question = currentId ? questionById.get(currentId) : undefined;
  const resultMeta = result ? types.find((type) => type.id === result) : undefined;

  function answer(value: 'yes' | 'no') {
    if (!question) return;
    setAnswers((prev) => [...prev, { questionId: question.id, answer: value }]);
  }

  /** Rewind to just before the i-th answer. */
  function rewind(i: number) {
    setAnswers((prev) => prev.slice(0, i));
  }

  return (
    <div className="not-prose">
      <DbHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* left: question / result flow */}
          <div>
            {/* breadcrumb path */}
            <div className="mb-3 flex min-h-[1.75rem] flex-wrap items-center gap-1.5">
              <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted">
                {t.yourPath}
              </span>
              {answers.map((a, i) => {
                const q = questionById.get(a.questionId);
                if (!q) return null;
                return (
                  <button
                    key={`${a.questionId}-${i}`}
                    type="button"
                    onClick={() => rewind(i)}
                    title={q.text}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium transition-colors hover:border-accent/50',
                      a.answer === 'yes'
                        ? 'border-emerald-500/40 text-emerald-500'
                        : 'border-border text-muted',
                    )}
                  >
                    {a.answer === 'yes' ? (
                      <Check className="h-2.5 w-2.5" aria-hidden />
                    ) : (
                      <X className="h-2.5 w-2.5" aria-hidden />
                    )}
                    {a.answer === 'yes' ? q.yesLabel : q.noLabel}
                  </button>
                );
              })}
              {answers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAnswers([])}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-medium text-muted transition-colors hover:text-fg"
                >
                  <RotateCcw className="h-2.5 w-2.5" aria-hidden />
                  {t.startOver}
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {question && (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                      <HelpCircle className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-snug text-fg">{question.text}</p>
                      <p className="mt-1 text-xs text-muted">{question.hint}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => answer('yes')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
                    >
                      <Check className="h-4 w-4" aria-hidden />
                      {question.yesLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => answer('no')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      {question.noLabel}
                    </button>
                  </div>
                </motion.div>
              )}

              {result && resultMeta && (
                <motion.div
                  key={`result-${result}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border-2 border-accent/60 bg-surface p-5 shadow-md shadow-accent/10"
                >
                  <div className="mb-1 font-mono text-[0.65rem] uppercase tracking-wide text-accent">
                    {t.recommendedLabel}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const Icon = DB_TYPE_ICONS[result];
                      return (
                        <span
                          className={cn(
                            'grid h-10 w-10 place-items-center rounded-xl bg-surface-2',
                            DB_TYPE_TEXT[result],
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                      );
                    })()}
                    <div>
                      <div className="font-display text-lg font-semibold text-fg">
                        {resultMeta.label}
                      </div>
                      <div className="font-mono text-[0.65rem] text-muted">
                        {resultMeta.products}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-fg/85">
                    {t.results[result].why}
                  </p>
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/[0.08] p-2.5 text-xs leading-relaxed text-fg/80">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                    <span>
                      <span className="font-semibold text-amber-500">{t.caveatLabel}: </span>
                      {t.results[result].caveat}
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* right: candidate map */}
          <div>
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
              {t.candidatesLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {types.map((type) => {
                const Icon = DB_TYPE_ICONS[type.id];
                const isOut = eliminated.has(type.id);
                const isWinner = result === type.id;
                return (
                  <motion.div
                    key={type.id}
                    layout
                    animate={
                      isWinner
                        ? { scale: [1, 1.05, 1] }
                        : { scale: 1, opacity: isOut ? 0.35 : 1 }
                    }
                    transition={{ duration: 0.4 }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors',
                      isWinner
                        ? 'border-accent bg-accent/10 shadow-md shadow-accent/20'
                        : isOut
                          ? 'border-border/60 bg-surface/50'
                          : 'border-border bg-surface',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2',
                        isOut ? 'text-muted' : DB_TYPE_TEXT[type.id],
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          'truncate text-xs font-semibold',
                          isOut ? 'text-muted line-through decoration-border' : 'text-fg',
                        )}
                      >
                        {type.label}
                      </div>
                      <div className="truncate text-[0.62rem] text-muted">{type.tagline}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-5 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}
