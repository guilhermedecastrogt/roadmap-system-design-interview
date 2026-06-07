'use client';

import { motion } from 'framer-motion';

export type CompareData = {
  title: string;
  subtitle: string;
  aTitle: string;
  bTitle: string;
  rows: { aspect: string; a: string; b: string }[];
};

/**
 * Reusable side-by-side comparison of two options. Two aligned cards (A / B)
 * sharing the same aspect rows. Used across topics (static vs dynamic, stateful
 * vs stateless, L4 vs L7, …).
 */
export function CompareTwo({ data }: { data: CompareData }) {
  const cols = [
    { key: 'a' as const, title: data.aTitle },
    { key: 'b' as const, title: data.bTitle },
  ];
  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{data.title}</h3>
      <p className="mt-1 text-sm text-muted">{data.subtitle}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {cols.map((col, ci) => (
          <motion.div
            key={col.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: ci * 0.08 }}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
              <h4 className="font-display text-lg font-semibold text-fg">{col.title}</h4>
            </div>
            <dl className="space-y-3">
              {data.rows.map((row) => (
                <div
                  key={row.aspect}
                  className="border-t border-border pt-3 first:border-0 first:pt-0"
                >
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {row.aspect}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg/85">{row[col.key]}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
