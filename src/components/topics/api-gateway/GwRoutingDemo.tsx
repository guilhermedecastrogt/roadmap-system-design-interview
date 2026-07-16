'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Package, TowerControl, UserRound } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { gatewayContent, type ServiceId } from './content';
import { GwHeading, GwNode } from './GwKit';

const SERVICES: { id: ServiceId; icon: typeof UserRound; tone: 'violet' | 'emerald' | 'amber' }[] = [
  { id: 'users', icon: UserRound, tone: 'violet' },
  { id: 'payments', icon: CreditCard, tone: 'emerald' },
  { id: 'orders', icon: Package, tone: 'amber' },
];

const SERVICE_Y: Record<ServiceId, number> = { users: 14, payments: 50, orders: 86 };

const DOT_TONE: Record<ServiceId, string> = {
  users: 'bg-violet-500 shadow-violet-500/40',
  payments: 'bg-emerald-500 shadow-emerald-500/40',
  orders: 'bg-amber-500 shadow-amber-500/40',
};

type FlyingDot = { id: number; service: ServiceId };

/**
 * Path-based dispatch demo: the gateway owns a routing table; tapping a
 * request fires a dot from the gateway to the matching service and bumps its
 * hit counter — one door, many destinations.
 */
export function GwRoutingDemo({ locale }: { locale: Locale }) {
  const c = gatewayContent[locale];
  const t = c.routing;
  const s = c.shared;

  const [dots, setDots] = useState<FlyingDot[]>([]);
  const [hits, setHits] = useState<Record<ServiceId, number>>({ users: 0, payments: 0, orders: 0 });
  const [lastRoute, setLastRoute] = useState<ServiceId | null>(null);
  const [pulse, setPulse] = useState<ServiceId | null>(null);
  const idRef = useRef(0);

  function fire(service: ServiceId) {
    setLastRoute(service);
    setDots((prev) => [...prev, { id: idRef.current++, service }]);
  }

  function land(dot: FlyingDot) {
    setDots((prev) => prev.filter((d) => d.id !== dot.id));
    setHits((prev) => ({ ...prev, [dot.service]: prev[dot.service] + 1 }));
    setPulse(dot.service);
    setTimeout(() => setPulse((p) => (p === dot.service ? null : p)), 400);
  }

  return (
    <div className="not-prose">
      <GwHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* request buttons */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {t.routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => fire(route.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <span className="font-bold text-accent">{route.method}</span>
              <span className="text-fg/85">{route.path}</span>
            </button>
          ))}
        </div>
        <p className="mb-4 text-center text-[0.7rem] text-muted">{t.tapHint}</p>

        {/* stage */}
        <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-2 sm:gap-4">
          {/* gateway + routing table */}
          <div className="flex flex-col items-center justify-center gap-3">
            <GwNode icon={TowerControl} label={s.gateway} active tone="accent" />
            <div className="rounded-xl border border-border bg-surface p-2.5">
              <div className="mb-1.5 font-mono text-[0.6rem] uppercase tracking-wide text-muted">
                {t.tableLabel}
              </div>
              <table className="font-mono text-[0.65rem]">
                <tbody>
                  {t.routes.map((route) => (
                    <tr
                      key={route.id}
                      className={cn(
                        'transition-colors',
                        lastRoute === route.id ? 'text-accent' : 'text-fg/75',
                      )}
                    >
                      <td className="pr-2 font-semibold">
                        {`/${route.path.split('/')[1]}/**`}
                      </td>
                      <td className="pr-1 text-muted">→</td>
                      <td>{route.service}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* lanes */}
          <div className="relative min-w-[3rem]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {SERVICES.map((sv) => (
                <path
                  key={sv.id}
                  d={`M 0 50 C 45 50, 55 ${SERVICE_Y[sv.id]}, 100 ${SERVICE_Y[sv.id]}`}
                  fill="none"
                  strokeWidth={lastRoute === sv.id ? 2.5 : 1.5}
                  vectorEffect="non-scaling-stroke"
                  className={cn(
                    'transition-all',
                    lastRoute === sv.id ? 'stroke-accent/70' : 'stroke-border',
                  )}
                />
              ))}
            </svg>
            <AnimatePresence>
              {dots.map((dot) => {
                const y = SERVICE_Y[dot.service];
                return (
                  <motion.div
                    key={dot.id}
                    className={cn(
                      'absolute z-10 h-3 w-3 rounded-full shadow',
                      DOT_TONE[dot.service],
                    )}
                    initial={{ left: '0%', top: '50%', x: '-50%', y: '-50%', opacity: 0 }}
                    animate={{
                      left: ['0%', '50%', '97%'],
                      top: ['50%', `${(50 + y) / 2}%`, `${y}%`],
                      opacity: [0, 1, 1],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    onAnimationComplete={() => land(dot)}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* services + hit counters */}
          <div className="flex flex-col justify-between gap-3 py-1">
            {SERVICES.map((sv) => (
              <motion.div
                key={sv.id}
                animate={pulse === sv.id ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <GwNode
                  icon={sv.icon}
                  label={s.services[sv.id]}
                  tone={sv.tone}
                  size="sm"
                  active={pulse === sv.id || hits[sv.id] > 0}
                />
                <div className="text-center">
                  <div className="font-mono text-base font-bold tabular-nums text-fg">
                    {hits[sv.id]}
                  </div>
                  <div className="text-[0.55rem] uppercase tracking-wide text-muted">
                    {t.hitsLabel}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="mt-5 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}
