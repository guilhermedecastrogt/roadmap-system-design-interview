'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, MonitorSmartphone, Package, Send, TowerControl } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { gatewayContent } from './content';
import { GwHeading, GwNode } from './GwKit';

type Phase =
  | 'idle'
  | 'req-edge'
  | 'translating'
  | 'req-internal'
  | 'resp-internal'
  | 'translating-back'
  | 'resp-edge';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Protocol translation viz: the client's HTTP/JSON request flies to the
 * gateway, morphs into a compact gRPC/protobuf message, continues to the
 * service over the internal network, and the response makes the same trip in
 * reverse — JSON outside, binary inside.
 */
export function GwProtocolTranslation({ locale }: { locale: Locale }) {
  const c = gatewayContent[locale];
  const t = c.protocol;
  const s = c.shared;

  const [phase, setPhase] = useState<Phase>('idle');
  const runRef = useRef(0);
  const running = phase !== 'idle';

  async function send() {
    if (running) return;
    const id = ++runRef.current;
    const step = async (p: Phase, ms: number) => {
      setPhase(p);
      await sleep(ms);
      return runRef.current === id;
    };

    if (!(await step('req-edge', 1000))) return;
    if (!(await step('translating', 700))) return;
    if (!(await step('req-internal', 1000))) return;
    if (!(await step('resp-internal', 1000))) return;
    if (!(await step('translating-back', 700))) return;
    if (!(await step('resp-edge', 1000))) return;
    setPhase('idle');
  }

  const isResponse = phase === 'resp-internal' || phase === 'translating-back' || phase === 'resp-edge';

  return (
    <div className="not-prose">
      <GwHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={send}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden />
            {running ? s.sending : t.send}
          </button>
        </div>

        {/* stage */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 sm:gap-3">
          <GwNode icon={MonitorSmartphone} label={s.client} active={running} tone="accent" />

          {/* edge zone: HTTP/JSON */}
          <div className="relative">
            <div className="rounded-xl border border-accent/25 bg-accent/[0.04] px-2 pb-2 pt-1.5">
              <div className="mb-1 text-center font-mono text-[0.58rem] uppercase tracking-wide text-accent/80">
                {t.edgeLabel}
              </div>
              <div className="relative h-20">
                <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-accent/15" />
                <AnimatePresence>
                  {(phase === 'req-edge' || phase === 'resp-edge') && (
                    <motion.div
                      key={phase}
                      className="absolute top-1/2 z-10 -translate-y-1/2"
                      initial={{ left: phase === 'req-edge' ? '0%' : '68%', opacity: 0 }}
                      animate={{ left: phase === 'req-edge' ? '68%' : '0%', opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.95, ease: 'easeInOut' }}
                    >
                      <JsonCard
                        title={phase === 'req-edge' ? 'POST /orders' : '201 Created'}
                        body={
                          phase === 'req-edge'
                            ? '{ "item": "book", "qty": 1 }'
                            : '{ "orderId": "o_991" }'
                        }
                        ok={phase !== 'req-edge'}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* gateway */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              animate={
                phase === 'translating' || phase === 'translating-back'
                  ? { rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.6 }}
              className={cn(
                'grid h-14 w-14 place-items-center rounded-xl border-2 bg-surface transition-colors',
                phase === 'translating' || phase === 'translating-back'
                  ? 'border-accent text-accent shadow-md shadow-accent/20'
                  : 'border-border text-muted',
              )}
            >
              <TowerControl className="h-6 w-6" aria-hidden />
            </motion.div>
            <div className="text-xs font-semibold text-fg">{s.gateway}</div>
            <div className="h-4">
              <AnimatePresence>
                {(phase === 'translating' || phase === 'translating-back') && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1 font-mono text-[0.62rem] font-medium text-accent"
                  >
                    <ArrowLeftRight className="h-3 w-3" aria-hidden />
                    {t.translating}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* internal zone: gRPC */}
          <div className="relative">
            <div className="rounded-xl border border-violet-500/25 bg-violet-500/[0.05] px-2 pb-2 pt-1.5">
              <div className="mb-1 text-center font-mono text-[0.58rem] uppercase tracking-wide text-violet-500/90">
                {t.internalLabel}
              </div>
              <div className="relative h-20">
                <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-violet-500/15" />
                <AnimatePresence>
                  {(phase === 'req-internal' || phase === 'resp-internal') && (
                    <motion.div
                      key={phase}
                      className="absolute top-1/2 z-10 -translate-y-1/2"
                      initial={{ left: phase === 'req-internal' ? '0%' : '68%', opacity: 0 }}
                      animate={{ left: phase === 'req-internal' ? '68%' : '0%', opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.95, ease: 'easeInOut' }}
                    >
                      <GrpcCard
                        title={
                          phase === 'req-internal'
                            ? 'orders.Orders/Create'
                            : 'CreateReply'
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <GwNode
            icon={Package}
            label={s.services.orders}
            active={phase === 'req-internal' || phase === 'resp-internal'}
            tone="amber"
          />
        </div>

        {/* request / response direction hint */}
        <div className="mt-2 text-center font-mono text-[0.65rem] text-muted">
          {running && (isResponse ? `← ${t.responseTitle}` : `${t.requestTitle} →`)}
          {!running && ' '}
        </div>

        {/* why */}
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 text-sm font-semibold text-fg">{t.whyTitle}</div>
          <ul className="space-y-1.5">
            {t.why.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm text-fg/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-center text-xs text-muted">{t.note}</p>
      </div>
    </div>
  );
}

/** JSON request/response card shown on the public edge. */
function JsonCard({ title, body, ok }: { title: string; body: string; ok?: boolean }) {
  return (
    <div className="w-max rounded-lg border border-accent/40 bg-surface px-2.5 py-1.5 shadow-sm">
      <div className={cn('font-mono text-[0.62rem] font-bold', ok ? 'text-emerald-500' : 'text-accent')}>
        {title}
      </div>
      <div className="font-mono text-[0.58rem] text-fg/75">{body}</div>
    </div>
  );
}

/** Compact binary/protobuf message shown on the internal network. */
function GrpcCard({ title }: { title: string }) {
  return (
    <div className="w-max rounded-lg border border-violet-500/40 bg-surface px-2.5 py-1.5 shadow-sm">
      <div className="font-mono text-[0.62rem] font-bold text-violet-500">{title}</div>
      <div className="flex items-center gap-0.5 pt-0.5" aria-hidden>
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-1.5 rounded-[2px]',
              i % 3 === 0 ? 'bg-violet-500/80' : i % 2 === 0 ? 'bg-violet-500/40' : 'bg-violet-500/20',
            )}
          />
        ))}
      </div>
    </div>
  );
}
