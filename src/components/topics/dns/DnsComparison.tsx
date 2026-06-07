'use client';

import { motion } from 'framer-motion';
import { CornerDownLeft, GitBranch } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { dnsContent } from './content';

export function DnsComparison({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].comparison;

  const columns = [
    { key: 'recursive' as const, title: c.recursive, icon: CornerDownLeft },
    { key: 'iterative' as const, title: c.iterative, icon: GitBranch },
  ];

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {columns.map((col, ci) => (
          <motion.div
            key={col.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: ci * 0.08 }}
            className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent ring-1 ring-inset ring-accent/20">
                <col.icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
              </span>
              <h4 className="font-display text-lg font-semibold text-fg">{col.title}</h4>
            </div>

            <dl className="space-y-3">
              {c.rows.map((row) => (
                <div key={row.aspect} className="border-t border-border pt-3 first:border-0 first:pt-0">
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {row.aspect}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg/85">
                    {row[col.key]}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
