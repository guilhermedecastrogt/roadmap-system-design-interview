'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  MonitorSmartphone,
  Package,
  TowerControl,
  UserRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { gatewayContent, type ServiceId } from './content';
import { GwHeading, GwNode } from './GwKit';

const SERVICES: { id: ServiceId; icon: typeof UserRound; tone: 'violet' | 'emerald' | 'amber' }[] = [
  { id: 'users', icon: UserRound, tone: 'violet' },
  { id: 'payments', icon: CreditCard, tone: 'emerald' },
  { id: 'orders', icon: Package, tone: 'amber' },
];

const SERVICE_Y: number[] = [14, 50, 86];

/**
 * Toggle between the two architectures: the frontend wired straight into every
 * service (concerns duplicated in each one) vs a single gateway front door
 * (concerns enforced once). Pulses keep flowing so the shape of the traffic is
 * visible at a glance.
 */
export function GwBeforeAfter({ locale }: { locale: Locale }) {
  const c = gatewayContent[locale];
  const t = c.beforeAfter;
  const s = c.shared;

  const [withGateway, setWithGateway] = useState(false);

  return (
    <div className="not-prose">
      <GwHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* toggle */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {[
              { on: false, label: t.withoutLabel },
              { on: true, label: t.withLabel },
            ].map((opt) => (
              <button
                key={String(opt.on)}
                type="button"
                onClick={() => setWithGateway(opt.on)}
                className={cn(
                  'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors',
                  withGateway === opt.on ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={withGateway ? 'with' : 'without'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className={cn(
                'mb-4 text-center text-sm font-semibold',
                withGateway ? 'text-emerald-500' : 'text-amber-500',
              )}
            >
              {withGateway ? t.withHeading : t.withoutHeading}
            </p>

            {withGateway ? (
              /* ── with gateway: frontend → gateway → services ── */
              <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-stretch gap-1 sm:gap-2">
                <div className="grid place-items-center">
                  <GwNode icon={MonitorSmartphone} label={s.client} active tone="accent" />
                </div>

                {/* frontend -> gateway */}
                <div className="relative min-w-[2rem]">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
                  <motion.div
                    className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent"
                    animate={{ left: ['2%', '95%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* gateway with centralized concerns */}
                <div className="grid place-items-center">
                  <div className="flex w-36 flex-col items-center rounded-2xl border-2 border-accent/60 bg-surface p-3 shadow-sm sm:w-40">
                    <TowerControl className="h-6 w-6 text-accent" aria-hidden />
                    <div className="mt-1 text-xs font-bold text-fg">{s.gateway}</div>
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {t.concerns.map((concern) => (
                        <span
                          key={concern}
                          className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-medium text-emerald-500"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[0.62rem] font-semibold text-emerald-500">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      {t.centralizedTag}
                    </span>
                  </div>
                </div>

                {/* gateway -> services */}
                <div className="relative min-w-[2rem]">
                  <FanLanes tone="emerald" />
                </div>

                <ServicesColumn labels={s.services} />
              </div>
            ) : (
              /* ── without gateway: frontend wired into every service ── */
              <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-1 sm:gap-2">
                <div className="grid place-items-center">
                  <GwNode icon={MonitorSmartphone} label={s.client} active tone="accent" />
                </div>

                <div className="relative min-w-[4rem]">
                  <FanLanes tone="amber" />
                </div>

                <ServicesColumn
                  labels={s.services}
                  badge={
                    <span className="mt-1 inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 font-mono text-[0.58rem] font-medium text-rose-500">
                      <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
                      {t.concerns.join(' · ')}
                    </span>
                  }
                  badgeTag={t.duplicatedTag}
                />
              </div>
            )}

            {/* bullet points */}
            <ul className="mx-auto mt-5 max-w-xl space-y-1.5">
              {(withGateway ? t.withPoints : t.withoutPoints).map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-start gap-2 text-sm text-fg/85"
                >
                  <span
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                      withGateway ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                    aria-hidden
                  />
                  {point}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <p className="mt-5 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}

function ServicesColumn({
  labels,
  badge,
  badgeTag,
}: {
  labels: Record<ServiceId, string>;
  badge?: React.ReactNode;
  badgeTag?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 py-1">
      {SERVICES.map((sv) => (
        <div key={sv.id} className="flex flex-col items-center">
          <GwNode icon={sv.icon} label={labels[sv.id]} tone={sv.tone} size="sm" active />
          {badge}
          {badgeTag && (
            <span className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-wide text-rose-500">
              {badgeTag}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Three curved lanes fanning out to the stacked services, with looping pulses. */
function FanLanes({ tone }: { tone: 'amber' | 'emerald' }) {
  return (
    <>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {SERVICE_Y.map((y) => (
          <path
            key={y}
            d={`M 0 50 C 45 50, 55 ${y}, 100 ${y}`}
            fill="none"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            className={tone === 'amber' ? 'stroke-amber-500/40' : 'stroke-emerald-500/40'}
            strokeDasharray={tone === 'amber' ? '4 4' : undefined}
          />
        ))}
      </svg>
      {SERVICE_Y.map((y, i) => (
        <motion.div
          key={y}
          className={cn(
            'absolute h-2 w-2 rounded-full',
            tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500',
          )}
          initial={{ left: '0%', top: '50%', x: '-50%', y: '-50%', opacity: 0 }}
          animate={{
            left: ['0%', '50%', '96%'],
            top: ['50%', `${(50 + y) / 2}%`, `${y}%`],
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}
