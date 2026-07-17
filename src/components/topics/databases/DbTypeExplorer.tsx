'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { databaseContent } from './content';
import { DbHeading, DB_TYPE_ICONS, DB_TYPE_TEXT } from './DbKit';

/**
 * The database family tree: eight tappable family cards with a detail panel
 * showing the data model, where each shines, the honest watch-out, and the
 * product names worth dropping in an interview.
 */
export function DbTypeExplorer({ locale }: { locale: Locale }) {
  const t = databaseContent[locale].explorer;
  const [selected, setSelected] = useState(0);
  const type = t.types[selected];
  const Icon = DB_TYPE_ICONS[type.id];

  return (
    <div className="not-prose">
      <DbHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* family grid */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            {t.types.map((item, i) => {
              const ItemIcon = DB_TYPE_ICONS[item.id];
              const active = selected === i;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all',
                    active
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-surface hover:border-accent/40',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2',
                      DB_TYPE_TEXT[item.id],
                    )}
                  >
                    <ItemIcon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block truncate text-sm font-semibold leading-tight',
                        active ? 'text-accent' : 'text-fg',
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block truncate text-[0.62rem] text-muted">
                      {item.tagline}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[0.7rem] text-muted">{t.tapHint}</p>
        </div>

        {/* detail panel */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'grid h-10 w-10 place-items-center rounded-xl bg-surface-2',
                    DB_TYPE_TEXT[type.id],
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold text-fg">{type.label}</h4>
                  <div className="text-xs text-muted">{type.tagline}</div>
                </div>
              </div>

              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.modelLabel}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg/85">{type.model}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.greatForLabel}
                  </dt>
                  <dd className="mt-1.5">
                    <ul className="space-y-1">
                      {type.greatFor.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-fg/85">
                          <span
                            className={cn(
                              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current',
                              DB_TYPE_TEXT[type.id],
                            )}
                            aria-hidden
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.watchOutLabel}
                  </dt>
                  <dd className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-fg/85">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                    {type.watchOut}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.productsLabel}
                  </dt>
                  <dd className="mt-1 font-mono text-xs font-medium text-accent">
                    {type.products}
                  </dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
