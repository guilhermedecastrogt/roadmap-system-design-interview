'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, Lightbulb } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent, type RecordType } from './content';

const TYPES: RecordType[] = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'];

const TYPE_STYLE: Record<RecordType, { chip: string; badge: string }> = {
  A: {
    chip: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  AAAA: {
    chip: 'border-sky-500/60 bg-sky-500/10 text-sky-600 dark:text-sky-400',
    badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  CNAME: {
    chip: 'border-violet-500/60 bg-violet-500/10 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  MX: {
    chip: 'border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  NS: {
    chip: 'border-rose-500/60 bg-rose-500/10 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  TXT: {
    chip: 'border-teal-500/60 bg-teal-500/10 text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  },
};

/**
 * Record-type explorer: pick a type and read the zone-file line it would
 * produce, plus what it's for. Makes "DNS stores records, not just IPs"
 * concrete.
 */
export function DnsRecords({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].records;
  const [type, setType] = useState<RecordType>('A');
  const item = c.items[type];

  return (
    <section className="not-prose">
      <header className="mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{c.kicker}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
          {c.title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{c.subtitle}</p>
      </header>

      {/* Type chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'rounded-lg border px-3.5 py-1.5 font-mono text-sm font-semibold transition-all duration-300',
              t === type
                ? cn(TYPE_STYLE[t].chip, 'scale-105 shadow-sm')
                : 'border-border text-muted hover:border-accent/40 hover:text-fg',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        {/* Zone file card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border bg-surface-2/60 px-4 py-2.5">
            <FileCode2 className="h-4 w-4 text-muted" aria-hidden />
            <span className="font-mono text-xs text-muted">{c.zoneTitle}</span>
          </div>
          <div className="overflow-x-auto p-4 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex min-w-max items-center gap-4 font-mono text-sm"
              >
                <span className="text-fg">{item.name}</span>
                <span className="tabular-nums text-muted">{item.ttl}</span>
                <span className="text-muted">IN</span>
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-bold',
                    TYPE_STYLE[type].badge,
                  )}
                >
                  {type}
                </span>
                <span className="font-semibold text-accent">{item.value}</span>
              </motion.div>
            </AnimatePresence>
            <div className="mt-4 grid grid-cols-5 gap-4 border-t border-border pt-2 font-mono text-[0.62rem] uppercase tracking-wide text-muted/70">
              <span>name</span>
              <span>ttl</span>
              <span>class</span>
              <span>type</span>
              <span>value</span>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              {c.whatLabel}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg/90">{item.what}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              <Lightbulb className="h-3.5 w-3.5" aria-hidden />
              {c.whenLabel}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg/80">{item.when}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
