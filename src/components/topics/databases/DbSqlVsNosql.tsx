'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Braces, Database, FileJson, Lock, Scale, Table2, Wrench } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { databaseContent } from './content';
import { DbHeading } from './DbKit';

/**
 * SQL vs NoSQL playground: flip a toggle and watch schema shape, query model,
 * consistency profile, and home-turf workloads morph between the two worlds —
 * then tap the myth cards to reveal the nuanced reality.
 */
export function DbSqlVsNosql({ locale }: { locale: Locale }) {
  const c = databaseContent[locale];
  const t = c.compare;

  const [side, setSide] = useState<'sql' | 'nosql'>('sql');
  const [revealed, setRevealed] = useState<boolean[]>(t.myths.map(() => false));

  const isSql = side === 'sql';

  return (
    <div className="not-prose">
      <DbHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* toggle */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['sql', 'nosql'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSide(opt)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
                  side === opt ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {opt === 'sql' ? (
                  <Table2 className="h-4 w-4" aria-hidden />
                ) : (
                  <Braces className="h-4 w-4" aria-hidden />
                )}
                {opt === 'sql' ? c.shared.sqlShort : c.shared.nosqlShort}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={side}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {/* schema shape — with a little visual */}
            <FacetCard icon={Database} label={t.facets.schema.label}>
              <div className="mb-3">
                {isSql ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="grid grid-cols-4 bg-surface-2">
                      {t.sqlSchemaCols.map((col) => (
                        <div
                          key={col}
                          className="border-r border-border px-2 py-1 font-mono text-[0.6rem] font-bold text-accent last:border-r-0"
                        >
                          {col}
                        </div>
                      ))}
                    </div>
                    {[0, 1].map((row) => (
                      <div key={row} className="grid grid-cols-4 border-t border-border">
                        {t.sqlSchemaCols.map((col) => (
                          <div
                            key={col}
                            className="border-r border-border px-2 py-1 last:border-r-0"
                          >
                            <div className="h-1.5 w-3/4 rounded-full bg-border" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg border border-emerald-500/40 bg-surface p-2 font-mono text-[0.58rem] leading-relaxed text-fg/75">
                      {'{ "id": 1,'}
                      <br />
                      {'  "name": "Ana",'}
                      <br />
                      {'  "theme": "dark" }'}
                    </div>
                    <div className="flex-1 rounded-lg border border-emerald-500/40 bg-surface p-2 font-mono text-[0.58rem] leading-relaxed text-fg/75">
                      {'{ "id": 2,'}
                      <br />
                      {'  "name": "Bo",'}
                      <br />
                      {'  "tags": ["pro"],'}
                      <br />
                      {'  "beta": true }'}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs leading-relaxed text-fg/85">
                {isSql ? t.facets.schema.sql : t.facets.schema.nosql}
              </p>
            </FacetCard>

            {/* query model — with snippet */}
            <FacetCard icon={Wrench} label={t.facets.query.label}>
              <pre className="mb-3 overflow-x-auto rounded-lg bg-surface-2 p-2.5 font-mono text-[0.62rem] leading-relaxed text-fg/80">
                {isSql ? t.facets.query.sqlSnippet : t.facets.query.nosqlSnippet}
              </pre>
              <p className="text-xs leading-relaxed text-fg/85">
                {isSql ? t.facets.query.sql : t.facets.query.nosql}
              </p>
            </FacetCard>

            {/* consistency */}
            <FacetCard icon={Lock} label={t.facets.consistency.label}>
              <p className="text-xs leading-relaxed text-fg/85">
                {isSql ? t.facets.consistency.sql : t.facets.consistency.nosql}
              </p>
            </FacetCard>

            {/* workloads */}
            <FacetCard icon={Scale} label={t.facets.workloads.label}>
              <p className="text-xs leading-relaxed text-fg/85">
                {isSql ? t.facets.workloads.sql : t.facets.workloads.nosql}
              </p>
            </FacetCard>
          </motion.div>
        </AnimatePresence>

        {/* myths */}
        <div className="mt-8">
          <h4 className="font-display text-base font-semibold text-fg">{t.mythsTitle}</h4>
          <p className="mt-0.5 text-xs text-muted">{t.mythsHint}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {t.myths.map((m, i) => {
              const shown = revealed[i];
              return (
                <button
                  key={m.myth}
                  type="button"
                  onClick={() =>
                    setRevealed((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                  }
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    shown
                      ? 'border-emerald-500/50 bg-emerald-500/[0.06]'
                      : 'border-rose-500/40 bg-rose-500/[0.05] hover:border-rose-500/70',
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={shown ? 'reality' : 'myth'}
                      initial={{ opacity: 0, rotateX: 60 }}
                      animate={{ opacity: 1, rotateX: 0 }}
                      exit={{ opacity: 0, rotateX: -60 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div
                        className={cn(
                          'mb-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-wide',
                          shown ? 'text-emerald-500' : 'text-rose-500',
                        )}
                      >
                        {shown ? t.realityLabel : t.mythLabel}
                      </div>
                      <p
                        className={cn(
                          'text-xs leading-relaxed',
                          shown ? 'text-fg/85' : 'font-medium text-fg',
                        )}
                      >
                        {shown ? m.reality : m.myth}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}

function FacetCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Database;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" aria-hidden />
        <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
