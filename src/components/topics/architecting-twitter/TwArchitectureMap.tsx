'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Cloud,
  Play,
  Smartphone,
  Server,
  Boxes,
  type LucideIcon,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { twContent, type StoreId } from './content';
import { TwHeading, TwStage, TwButton, STORE_META } from './TwKit';

const LAYER_ICON: Record<string, LucideIcon> = {
  client: Smartphone,
  edge: Cloud,
  gateway: Server,
  services: Boxes,
  stores: Boxes,
};

/**
 * The high-level architecture map. A stacked set of layers (client → edge →
 * gateway → services → stores). "Trace a request" lights each layer top to
 * bottom, and the store row doubles as an inspector: tap Redis / MongoDB /
 * Kafka / Elasticsearch / S3 to read why it was chosen.
 */
export function TwArchitectureMap({ locale }: { locale: Locale }) {
  const c = twContent[locale].architecture;
  const [activeLayer, setActiveLayer] = useState(-1);
  const [tracing, setTracing] = useState(false);
  const [openStore, setOpenStore] = useState<StoreId>('redis');

  useEffect(() => {
    if (!tracing) return;
    if (activeLayer >= c.layers.length - 1) {
      const t = setTimeout(() => {
        setTracing(false);
        setActiveLayer(-1);
      }, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActiveLayer((n) => n + 1), 620);
    return () => clearTimeout(t);
  }, [tracing, activeLayer, c.layers.length]);

  function trace() {
    if (tracing) return;
    setActiveLayer(0);
    setTracing(true);
  }

  const store = c.services.find((s) => s.id === openStore)!;
  const StoreDetailIcon = STORE_META[openStore].icon;

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        <div className="mb-4 flex justify-end">
          <TwButton onClick={trace} disabled={tracing}>
            <Play className="h-4 w-4" aria-hidden />
            {c.pulseLabel}
          </TwButton>
        </div>

        {/* Layer stack */}
        <div className="space-y-2.5">
          {c.layers.map((layer, i) => {
            const Icon = LAYER_ICON[layer.id];
            const lit = tracing && i <= activeLayer;
            const isStores = layer.id === 'stores';
            return (
              <div key={layer.id}>
                {i > 0 && (
                  <div className="mx-auto my-1 flex justify-center">
                    <motion.div
                      animate={{
                        opacity: tracing && i <= activeLayer ? 1 : 0.25,
                        y: tracing && i === activeLayer ? [0, 3, 0] : 0,
                      }}
                      transition={{ duration: 0.5, repeat: tracing && i === activeLayer ? Infinity : 0 }}
                      className="text-muted"
                    >
                      <ChevronRight className="h-4 w-4 rotate-90" aria-hidden />
                    </motion.div>
                  </div>
                )}
                <motion.div
                  animate={{
                    borderColor: lit ? 'rgb(var(--accent))' : 'rgb(var(--border))',
                    backgroundColor: lit ? 'rgb(var(--accent) / 0.06)' : 'rgb(var(--surface) / 0)',
                  }}
                  className="rounded-xl border p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon
                      className={cn('h-4 w-4', lit ? 'text-accent' : 'text-muted')}
                      aria-hidden
                    />
                    <span className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
                      {layer.label}
                    </span>
                    {isStores && (
                      <span className="ml-auto font-mono text-[0.62rem] text-accent">
                        {c.inspectorHint} ↓
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map((item) => {
                      const asStore = isStores
                        ? c.services.find((s) => s.name === item)
                        : undefined;
                      if (asStore) {
                        const meta = STORE_META[asStore.id];
                        const ItemIcon = meta.icon;
                        const open = openStore === asStore.id;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setOpenStore(asStore.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                              open ? 'bg-surface-2 text-fg' : 'bg-surface text-muted hover:text-fg',
                            )}
                            style={{ borderColor: open ? meta.color : 'rgb(var(--border))' }}
                          >
                            <ItemIcon className="h-3.5 w-3.5" style={{ color: meta.color }} aria-hidden />
                            {item}
                          </button>
                        );
                      }
                      return (
                        <span
                          key={item}
                          className={cn(
                            'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                            lit ? 'border-accent/40 bg-surface text-fg' : 'border-border bg-surface text-muted',
                          )}
                        >
                          {item}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Store inspector */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={openStore}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="rounded-xl border p-4"
              style={{ borderColor: STORE_META[openStore].color }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-8 w-8 place-items-center rounded-lg"
                  style={{ background: `${STORE_META[openStore].color}22` }}
                >
                  <StoreDetailIcon className="h-4 w-4" style={{ color: STORE_META[openStore].color }} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-fg">{store.name}</p>
                  <p className="font-mono text-[0.68rem] uppercase tracking-wide text-muted">{store.role}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg/85">{store.why}</p>
              <p className="mt-2 text-xs italic leading-relaxed text-muted">{store.note}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </TwStage>
    </div>
  );
}
