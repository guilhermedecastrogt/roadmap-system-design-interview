'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Cloud,
  Database,
  FileText,
  Gauge,
  Image,
  Layers,
  Lock,
  Maximize2,
  MessageSquare,
  MonitorSmartphone,
  Network,
  Rss,
  Search,
  Server,
  Share2,
  User,
  Users,
  Zap,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { twContent } from './content';
import { TwHeading, TwStage } from './TwKit';

// Generous canvas — nodes are spread out so edges have clearance between cards.
const W = 1600;
const H = 1320;

const ACCENT = 'rgb(var(--accent))';
const MUTED = 'rgb(var(--muted))';
const VIOLET = 'rgb(139 92 246)';
const GREEN = 'rgb(16 185 129)';
const SKY = 'rgb(56 189 248)';
const YELLOW = 'rgb(202 138 4)';
const RED = 'rgb(239 68 68)';

type NodeId =
  | 'cdn' | 'client' | 'lb' | 'gateway' | 'rateLimit1' | 'cache' | 'rateLimit2'
  | 'tweet' | 'reply' | 'search' | 'timeline' | 'profile' | 'auth'
  | 'tweetContent' | 'media' | 'mq' | 'fanout' | 'replies' | 'es'
  | 'timelineCache' | 'userData' | 'following';

type NodeLabel =
  | 'cdn' | 'client' | 'lb' | 'gateway' | 'rateLimit' | 'cache' | 'tweet' | 'reply'
  | 'search' | 'timeline' | 'fanout' | 'profile' | 'auth' | 'mq' | 'tweetContent'
  | 'media' | 'replies' | 'es' | 'timelineCache' | 'userData' | 'following';

type NodeDef = { x: number; y: number; w: number; h: number; icon: LucideIcon; tint?: string; labelKey: NodeLabel; sub?: boolean };

const NODES: Record<NodeId, NodeDef> = {
  cdn: { x: 150, y: 130, w: 118, h: 84, icon: Cloud, tint: SKY, labelKey: 'cdn' },
  client: { x: 150, y: 600, w: 150, h: 112, icon: MonitorSmartphone, labelKey: 'client', sub: true },
  lb: { x: 380, y: 660, w: 148, h: 66, icon: Network, labelKey: 'lb' },
  gateway: { x: 580, y: 600, w: 148, h: 66, icon: Server, tint: ACCENT, labelKey: 'gateway' },
  rateLimit1: { x: 745, y: 420, w: 96, h: 58, icon: Gauge, labelKey: 'rateLimit' },
  cache: { x: 755, y: 540, w: 110, h: 56, icon: Zap, tint: RED, labelKey: 'cache' },
  rateLimit2: { x: 755, y: 660, w: 96, h: 58, icon: Gauge, labelKey: 'rateLimit' },
  tweet: { x: 970, y: 420, w: 150, h: 68, icon: FileText, labelKey: 'tweet' },
  reply: { x: 970, y: 600, w: 150, h: 68, icon: MessageSquare, labelKey: 'reply' },
  search: { x: 970, y: 780, w: 150, h: 66, icon: Search, labelKey: 'search' },
  timeline: { x: 985, y: 960, w: 156, h: 68, icon: Rss, labelKey: 'timeline' },
  profile: { x: 990, y: 1140, w: 156, h: 66, icon: User, labelKey: 'profile' },
  auth: { x: 990, y: 1265, w: 148, h: 62, icon: Lock, labelKey: 'auth' },
  tweetContent: { x: 970, y: 170, w: 156, h: 68, icon: Database, tint: GREEN, labelKey: 'tweetContent' },
  media: { x: 1200, y: 170, w: 142, h: 68, icon: Image, tint: SKY, labelKey: 'media' },
  mq: { x: 1230, y: 420, w: 150, h: 62, icon: Layers, tint: VIOLET, labelKey: 'mq' },
  fanout: { x: 1470, y: 420, w: 156, h: 74, icon: Share2, tint: VIOLET, labelKey: 'fanout' },
  replies: { x: 1230, y: 600, w: 140, h: 66, icon: Database, tint: GREEN, labelKey: 'replies' },
  es: { x: 1230, y: 780, w: 152, h: 66, icon: Search, tint: YELLOW, labelKey: 'es' },
  timelineCache: { x: 1500, y: 600, w: 158, h: 76, icon: Zap, tint: RED, labelKey: 'timelineCache' },
  userData: { x: 1280, y: 1095, w: 144, h: 66, icon: Database, tint: GREEN, labelKey: 'userData' },
  following: { x: 1280, y: 1245, w: 144, h: 66, icon: Users, tint: GREEN, labelKey: 'following' },
};

type EdgeDef = {
  from: NodeId;
  to: NodeId;
  color: string;
  bi?: boolean;
  dash?: boolean;
  labelKey?: 'https' | 'cdc' | 'fanoutWrite' | 'fanoutRead' | 'deliver';
  bend?: number;
  labelDx?: number;
  labelDy?: number;
};

const EDGES: EdgeDef[] = [
  { from: 'cdn', to: 'client', color: SKY, bend: -34 },
  { from: 'media', to: 'cdn', color: SKY, labelKey: 'deliver', bend: -230 },
  { from: 'client', to: 'lb', color: ACCENT, bi: true, labelKey: 'https', labelDy: -12 },
  { from: 'lb', to: 'gateway', color: ACCENT, bi: true },
  { from: 'gateway', to: 'rateLimit1', color: ACCENT },
  { from: 'rateLimit1', to: 'tweet', color: ACCENT },
  { from: 'gateway', to: 'cache', color: ACCENT },
  { from: 'cache', to: 'tweet', color: MUTED, dash: true },
  { from: 'gateway', to: 'rateLimit2', color: ACCENT },
  { from: 'rateLimit2', to: 'reply', color: ACCENT },
  { from: 'gateway', to: 'search', color: ACCENT, bend: 150 },
  { from: 'gateway', to: 'timeline', color: ACCENT, bend: 70 },
  { from: 'gateway', to: 'profile', color: ACCENT, bend: 40 },
  { from: 'tweet', to: 'tweetContent', color: GREEN, bi: true },
  { from: 'tweet', to: 'media', color: SKY },
  { from: 'tweet', to: 'mq', color: VIOLET },
  { from: 'mq', to: 'fanout', color: VIOLET, labelKey: 'fanoutWrite', labelDy: -54 },
  { from: 'fanout', to: 'timelineCache', color: VIOLET },
  { from: 'tweetContent', to: 'es', color: YELLOW, dash: true, labelKey: 'cdc', bend: -90 },
  { from: 'reply', to: 'replies', color: GREEN },
  { from: 'search', to: 'es', color: YELLOW, bi: true },
  { from: 'timeline', to: 'timelineCache', color: RED, bi: true, labelKey: 'fanoutRead', bend: 150, labelDy: 8 },
  { from: 'timeline', to: 'following', color: GREEN },
  { from: 'profile', to: 'userData', color: GREEN, bi: true },
  { from: 'profile', to: 'following', color: GREEN, bi: true },
  { from: 'profile', to: 'auth', color: MUTED, bi: true },
];

/** Boundary point on node `n` toward (tx,ty), plus a small gap for the arrowhead. */
function boundary(n: NodeDef, tx: number, ty: number, gap = 8) {
  const dx = tx - n.x;
  const dy = ty - n.y;
  const hw = n.w / 2;
  const hh = n.h / 2;
  const sx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const sy = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  const bx = n.x + dx * s;
  const by = n.y + dy * s;
  const len = Math.hypot(dx, dy) || 1;
  return { x: bx + (dx / len) * gap, y: by + (dy / len) * gap };
}

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.8;

/**
 * TwBlueprint — the macro "everything at once" architecture map at the top of
 * the lesson. Pan by dragging, zoom with the buttons, and tap any node to light
 * up just the edges wired to it (everything else dims). One reference picture;
 * every animated panel below zooms into one of these paths.
 */
export function TwBlueprint({ locale }: { locale: Locale }) {
  const c = twContent[locale].blueprint;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.7);
  const [selected, setSelected] = useState<NodeId | null>(null);

  // Fit-to-width on mount and on resize (until the user zooms manually).
  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return 0.7;
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, (el.clientWidth - 8) / W));
    return z;
  }, []);
  useEffect(() => {
    setZoom(fit());
    const onResize = () => setZoom(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fit]);

  // Drag-to-pan.
  const drag = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);
  const [panning, setPanning] = useState(false);
  function onPointerDown(e: React.PointerEvent) {
    const el = viewportRef.current;
    if (!el) return;
    drag.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    setPanning(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    const el = viewportRef.current;
    if (!el || !drag.current) return;
    el.scrollLeft = drag.current.sl - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.st - (e.clientY - drag.current.y);
  }
  function endPan() {
    drag.current = null;
    setPanning(false);
  }

  const edgeConnected = (e: EdgeDef) => selected != null && (e.from === selected || e.to === selected);
  const nodeConnected = (id: NodeId) =>
    selected != null &&
    (id === selected ||
      EDGES.some((e) => (e.from === selected && e.to === id) || (e.to === selected && e.from === id)));

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        {/* legend + controls */}
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <svg width="24" height="8" aria-hidden>
              <line x1="0" y1="4" x2="24" y2="4" stroke="rgb(var(--accent))" strokeWidth="2" />
            </svg>
            {c.legend.request}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="24" height="8" aria-hidden>
              <line x1="0" y1="4" x2="24" y2="4" stroke={YELLOW} strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            {c.legend.async}
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.15).toFixed(2)))}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" aria-hidden />
            </button>
            <span className="w-11 text-center font-mono text-xs tabular-nums text-muted">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.15).toFixed(2)))}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(fit());
                setSelected(null);
                if (viewportRef.current) viewportRef.current.scrollTo({ left: 0, top: 0 });
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Maximize2 className="h-3.5 w-3.5" aria-hidden />
              {c.reset}
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className={cn(
            'relative overflow-auto rounded-xl border border-border bg-surface/60 select-none',
            panning ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{ height: 620, touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPan}
          onPointerLeave={endPan}
          onClick={() => setSelected(null)}
        >
          <div style={{ width: W * zoom, height: H * zoom }}>
            <div style={{ width: W, height: H, transform: `scale(${zoom})`, transformOrigin: 'top left', position: 'relative' }}>
              <svg width={W} height={H} className="absolute inset-0" aria-hidden style={{ overflow: 'visible' }}>
                <defs>
                  <marker id="tw-bp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
                  </marker>
                </defs>

                {EDGES.map((e, i) => {
                  const a = NODES[e.from];
                  const b = NODES[e.to];
                  const start = boundary(a, b.x, b.y);
                  const end = boundary(b, a.x, a.y);
                  const mx = (start.x + end.x) / 2;
                  const my = (start.y + end.y) / 2;

                  let d: string;
                  let lx = mx;
                  let ly = my;
                  if (e.bend) {
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    const len = Math.hypot(dx, dy) || 1;
                    const px = -dy / len;
                    const py = dx / len;
                    const cx = mx + px * e.bend;
                    const cy = my + py * e.bend;
                    d = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
                    lx = 0.25 * start.x + 0.5 * cx + 0.25 * end.x;
                    ly = 0.25 * start.y + 0.5 * cy + 0.25 * end.y;
                  } else {
                    d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
                  }

                  const connected = edgeConnected(e);
                  const dim = selected != null && !connected;
                  const opacity = dim ? 0.1 : e.color === MUTED ? 0.6 : 0.92;

                  return (
                    <g key={i}>
                      <path
                        d={d}
                        fill="none"
                        stroke={e.color}
                        strokeWidth={connected ? 4 : 2}
                        strokeDasharray={e.dash ? '6 4' : undefined}
                        strokeLinecap="round"
                        markerEnd="url(#tw-bp-arrow)"
                        markerStart={e.bi ? 'url(#tw-bp-arrow)' : undefined}
                        opacity={opacity}
                        style={connected ? { filter: `drop-shadow(0 0 5px ${e.color})` } : undefined}
                      />
                      {e.labelKey && (
                        <text
                          x={lx + (e.labelDx ?? 0)}
                          y={ly + (e.labelDy ?? 0)}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          opacity={dim ? 0.15 : 1}
                          style={{
                            fill: e.color === MUTED ? MUTED : e.color,
                            stroke: 'rgb(var(--surface))',
                            strokeWidth: 4,
                            paintOrder: 'stroke',
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {c.edges[e.labelKey]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {(Object.keys(NODES) as NodeId[]).map((id) => {
                const n = NODES[id];
                const Icon = n.icon;
                const tint = n.tint ?? MUTED;
                const isSel = selected === id;
                const isConn = nodeConnected(id);
                const dim = selected != null && !isConn;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setSelected((s) => (s === id ? null : id));
                    }}
                    className={cn(
                      'absolute z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border bg-surface text-center shadow-sm transition-all duration-200',
                      dim ? 'opacity-35' : 'opacity-100',
                    )}
                    style={{
                      left: n.x,
                      top: n.y,
                      width: n.w,
                      height: n.h,
                      borderColor: isSel || isConn ? tint : `color-mix(in srgb, ${tint} 45%, rgb(var(--border)))`,
                      boxShadow: isSel
                        ? `0 0 0 2px ${tint}, 0 6px 22px ${tint}55`
                        : isConn
                          ? `0 0 0 1px ${tint}`
                          : undefined,
                    }}
                  >
                    <Icon className="mb-0.5 h-4 w-4" style={{ color: tint }} aria-hidden />
                    <span className="px-1 text-[0.76rem] font-semibold leading-tight text-fg">{c.nodes[n.labelKey]}</span>
                    {n.sub && <span className="mt-0.5 font-mono text-[0.6rem] text-muted">{c.nodes.clientSub}</span>}
                    {id === 'lb' && <span className="mt-0.5 font-mono text-[0.56rem] text-muted">{c.lbNote}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* hint pinned to the viewport */}
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wide text-muted shadow-sm ring-1 ring-border">
            {selected ? c.nodes[NODES[selected].labelKey] : c.tapHint}
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">{c.note}</p>
      </TwStage>
    </div>
  );
}
