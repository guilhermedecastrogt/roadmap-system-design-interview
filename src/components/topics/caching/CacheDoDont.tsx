'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { cacheContent } from './content';

export function CacheDoDont({ locale }: { locale: Locale }) {
  const c = cacheContent[locale].dodont;

  const cols = [
    { title: c.goodTitle, items: c.good, good: true },
    { title: c.badTitle, items: c.bad, good: false },
  ];

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {cols.map((col, ci) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35, delay: ci * 0.08 }}
            className={cn(
              'rounded-2xl border bg-surface p-5',
              col.good ? 'border-emerald-500/30' : 'border-rose-500/30',
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-lg',
                  col.good
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500',
                )}
              >
                {col.good ? <Check className="h-4 w-4" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
              </span>
              <h4 className="font-display text-lg font-semibold text-fg">{col.title}</h4>
            </div>
            <ul className="space-y-2.5">
              {col.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-fg/85">
                  <span
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                      col.good ? 'bg-emerald-500' : 'bg-rose-500',
                    )}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
