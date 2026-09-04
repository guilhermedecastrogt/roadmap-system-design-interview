'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Braces, Pencil, Radio } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, CodeSurface, FactRow } from '../api-track/ApiKit';
import { SCHEMA_SDL, graphqlContent, type OperationId, type ResolverId } from './content';

const OP_ICON: Record<OperationId, typeof Braces> = {
  query: Braces,
  mutation: Pencil,
  subscription: Radio,
};

/**
 * Schema, operations and resolvers. The schema is the part everyone shows; the
 * resolvers are the part that decides whether the API survives production.
 */
export function GqlSchema({ locale }: { locale: Locale }) {
  const t = graphqlContent[locale].schema;
  const [resolverId, setResolverId] = useState<ResolverId>('author');
  const resolver = t.resolvers.find((r) => r.id === resolverId)!;

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeSurface title={t.sdlTitle} body={SCHEMA_SDL} tone="violet" />

          <div className="space-y-2">
            <p className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">
              {t.operationsTitle}
            </p>
            {t.operations.map((op, i) => {
              const Icon = OP_ICON[op.id];
              return (
                <motion.div
                  key={op.id}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, delay: i * 0.06 }}
                  className="rounded-xl border border-border bg-surface p-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-violet-500" aria-hidden />
                    <span className="text-sm font-semibold text-fg">{op.label}</span>
                  </div>
                  <p className="mt-1 text-[0.76rem] leading-snug text-muted">{op.what}</p>
                  <code className="mt-1.5 block overflow-x-auto rounded bg-surface-2 px-1.5 py-1 font-mono text-[0.62rem] text-fg/80">
                    {op.example}
                  </code>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* resolvers */}
        <div className="mt-5 border-t border-border pt-4">
          <p className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">
            {t.resolversTitle}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {t.resolvers.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setResolverId(r.id)}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 font-mono text-[0.7rem] font-medium transition-colors',
                  r.id === resolverId
                    ? 'border-violet-500 bg-violet-500/10 text-violet-500'
                    : 'border-border text-muted hover:text-fg',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.dl
              key={resolver.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-2.5 rounded-xl border border-border bg-surface p-3.5"
            >
              <FactRow label={t.whatLabel} value={resolver.what} />
              <FactRow
                label={t.watchLabel}
                value={<span className="text-amber-600 dark:text-amber-400">{resolver.watch}</span>}
              />
            </motion.dl>
          </AnimatePresence>
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
