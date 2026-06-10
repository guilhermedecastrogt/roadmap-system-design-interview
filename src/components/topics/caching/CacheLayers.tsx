'use client';

import { motion } from 'framer-motion';
import { Database, Globe, Network, Zap, type LucideIcon } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { cacheContent } from './content';

export function CacheLayers({ locale }: { locale: Locale }) {
  const c = cacheContent[locale].layers;

  const layers: { icon: LucideIcon; label: string; note?: string; cache: boolean }[] = [
    { icon: Globe, label: c.browser, note: c.browserNote, cache: true },
    { icon: Network, label: c.cdn, note: c.cdnNote, cache: true },
    { icon: Zap, label: c.backend, note: c.backendNote, cache: true },
    { icon: Database, label: c.database, cache: false },
  ];

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 flex flex-col items-stretch rounded-2xl border border-border bg-surface/40 p-6">
        {layers.map((l, i) => (
          <div key={l.label} className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={cn(
                'flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-4',
                l.cache ? 'border-accent/40 bg-accent/[0.05]' : 'border-border bg-surface',
              )}
            >
              <span
                className={cn(
                  'inline-flex w-fit shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold',
                  l.cache
                    ? 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/20'
                    : 'bg-surface-2 text-fg',
                )}
              >
                <l.icon className="h-4 w-4" aria-hidden />
                {l.label}
              </span>
              {l.note && <span className="text-sm text-muted">{l.note}</span>}
            </motion.div>
            {i < layers.length - 1 && (
              <span className="mx-auto h-5 w-px bg-border" aria-hidden />
            )}
          </div>
        ))}

        <p className="mt-5 text-center text-sm text-fg/80">{c.caption}</p>
      </div>
    </div>
  );
}
