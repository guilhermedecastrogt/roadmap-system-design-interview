'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Cpu, Database, HardDrive, PencilLine, Rss, Server, Zap, type LucideIcon } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { twContent } from './content';
import { TwHeading, TwStage } from './TwKit';

const SEC_PER_DAY = 86_400;
const PEAK = 3;
const TWEET_BYTES = 1_024; // 1 KB record
const MEDIA_BYTES = 2 * 1_024 * 1_024; // 2 MB
const CACHE_BYTES_PER_USER = 800 * 16; // 800 ids × 16 B
const RPS_PER_SERVER = 10_000;

/** Format a large count as K / M / B / T. */
function count(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

/** Format a byte count as KB / MB / GB / TB / PB. */
function bytes(n: number): string {
  const u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : 1)} ${u[i]}`;
}

export function TwEstimations({ locale }: { locale: Locale }) {
  const c = twContent[locale].estimations;
  const [dau, setDau] = useState(300); // millions
  const [tpu, setTpu] = useState(2); // tweets / user / day
  const [rpu, setRpu] = useState(50); // timeline loads / user / day
  const [mediaPct, setMediaPct] = useState(15); // %

  const users = dau * 1e6;
  const tweetsPerDay = users * tpu;
  const readsPerDay = users * rpu;
  const peakWrites = (tweetsPerDay / SEC_PER_DAY) * PEAK;
  const peakReads = (readsPerDay / SEC_PER_DAY) * PEAK;
  const storagePerDay = tweetsPerDay * TWEET_BYTES;
  const mediaPerYear = tweetsPerDay * (mediaPct / 100) * MEDIA_BYTES * 365;
  const cacheRam = users * CACHE_BYTES_PER_USER;
  const servers = Math.ceil(peakReads / RPS_PER_SERVER);

  const outputs: { icon: LucideIcon; label: string; value: string; sub?: string; tint: string }[] = [
    { icon: PencilLine, label: c.outputs.tweetsPerDay, value: count(tweetsPerDay), tint: 'rgb(var(--accent))' },
    { icon: ArrowDownUp, label: c.outputs.peakWrites, value: count(peakWrites), sub: c.peakLabel, tint: 'rgb(139 92 246)' },
    { icon: Rss, label: c.outputs.peakReads, value: count(peakReads), sub: c.peakLabel, tint: 'rgb(16 185 129)' },
    { icon: Database, label: c.outputs.storagePerDay, value: bytes(storagePerDay), tint: 'rgb(16 185 129)' },
    { icon: HardDrive, label: c.outputs.mediaPerYear, value: bytes(mediaPerYear), tint: 'rgb(56 189 248)' },
    { icon: Zap, label: c.outputs.cacheRam, value: bytes(cacheRam), tint: 'rgb(239 68 68)' },
    { icon: Server, label: c.outputs.servers, value: count(servers), tint: 'rgb(234 179 8)' },
  ];

  const sliders = [
    { v: dau, set: setDau, min: 50, max: 500, step: 10, ...c.inputs.dau },
    { v: tpu, set: setTpu, min: 0.5, max: 10, step: 0.5, ...c.inputs.tweetsPerUser },
    { v: rpu, set: setRpu, min: 10, max: 200, step: 10, ...c.inputs.readsPerUser },
    { v: mediaPct, set: setMediaPct, min: 0, max: 50, step: 5, ...c.inputs.mediaPct },
  ];

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* inputs */}
          <div className="space-y-4">
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted">{s.label}</span>
                  <span className="font-mono font-bold tabular-nums text-fg">
                    {s.v}
                    {s.unit && <span className="ml-0.5 text-xs text-muted">{s.unit}</span>}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.v}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full accent-accent"
                  aria-label={s.label}
                />
              </div>
            ))}

            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="mb-1.5 font-mono text-[0.62rem] uppercase tracking-widest text-muted">
                {c.assumptionsLabel}
              </p>
              <ul className="space-y-1">
                {c.assumptions.map((a) => (
                  <li key={a} className="flex gap-1.5 text-[0.7rem] leading-relaxed text-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* outputs */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {outputs.map((o) => {
              const Icon = o.icon;
              return (
                <div key={o.label} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" style={{ color: o.tint }} aria-hidden />
                    <span className="text-[0.62rem] leading-tight text-muted">{o.label}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <motion.span
                      key={o.value}
                      initial={{ opacity: 0.4, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-xl font-bold tabular-nums text-fg"
                    >
                      {o.value}
                    </motion.span>
                    {o.sub && <span className="text-[0.6rem] uppercase tracking-wide text-muted">{o.sub}</span>}
                  </div>
                </div>
              );
            })}
            <div className="col-span-2 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.06] p-3 sm:col-span-3 lg:col-span-2 xl:col-span-3">
              <Cpu className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <p className="text-[0.72rem] leading-relaxed text-fg/85">{c.note}</p>
            </div>
          </div>
        </div>
      </TwStage>
    </div>
  );
}
