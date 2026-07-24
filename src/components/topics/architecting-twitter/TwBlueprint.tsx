'use client';

import {
  Cloud,
  Database,
  FileText,
  Gauge,
  Image,
  Layers,
  Lock,
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
  type LucideIcon,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { twContent } from './content';
import { TwHeading, TwStage } from './TwKit';

const W = 1160;
const H = 950;

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

// The label keys available under content.blueprint.nodes (excluding clientSub).
type NodeLabel =
  | 'cdn' | 'client' | 'lb' | 'gateway' | 'rateLimit' | 'cache' | 'tweet' | 'reply'
  | 'search' | 'timeline' | 'fanout' | 'profile' | 'auth' | 'mq' | 'tweetContent'
  | 'media' | 'replies' | 'es' | 'timelineCache' | 'userData' | 'following';

type NodeDef = { x: number; y: number; w: number; h: number; icon: LucideIcon; tint?: string; labelKey: NodeLabel; sub?: boolean };

const NODES: Record<NodeId, NodeDef> = {
  cdn: { x: 130, y: 92, w: 104, h: 74, icon: Cloud, tint: SKY, labelKey: 'cdn' },
  client: { x: 122, y: 470, w: 132, h: 98, icon: MonitorSmartphone, labelKey: 'client', sub: true },
  lb: { x: 300, y: 512, w: 128, h: 58, icon: Network, labelKey: 'lb' },
  gateway: { x: 452, y: 480, w: 128, h: 58, icon: Server, tint: ACCENT, labelKey: 'gateway' },
  rateLimit1: { x: 556, y: 360, w: 80, h: 50, icon: Gauge, labelKey: 'rateLimit' },
  cache: { x: 560, y: 432, w: 92, h: 48, icon: Zap, tint: RED, labelKey: 'cache' },
  rateLimit2: { x: 566, y: 505, w: 80, h: 50, icon: Gauge, labelKey: 'rateLimit' },
  tweet: { x: 682, y: 342, w: 128, h: 60, icon: FileText, labelKey: 'tweet' },
  reply: { x: 682, y: 476, w: 128, h: 60, icon: MessageSquare, labelKey: 'reply' },
  search: { x: 682, y: 596, w: 128, h: 58, icon: Search, labelKey: 'search' },
  timeline: { x: 692, y: 706, w: 132, h: 60, icon: Rss, labelKey: 'timeline' },
  profile: { x: 696, y: 804, w: 132, h: 58, icon: User, labelKey: 'profile' },
  auth: { x: 696, y: 894, w: 128, h: 54, icon: Lock, labelKey: 'auth' },
  tweetContent: { x: 682, y: 150, w: 128, h: 60, icon: Database, tint: GREEN, labelKey: 'tweetContent' },
  media: { x: 838, y: 150, w: 120, h: 60, icon: Image, tint: SKY, labelKey: 'media' },
  mq: { x: 846, y: 342, w: 128, h: 54, icon: Layers, tint: VIOLET, labelKey: 'mq' },
  fanout: { x: 992, y: 342, w: 128, h: 64, icon: Share2, tint: VIOLET, labelKey: 'fanout' },
  replies: { x: 858, y: 476, w: 116, h: 58, icon: Database, tint: GREEN, labelKey: 'replies' },
  es: { x: 858, y: 596, w: 128, h: 58, icon: Search, tint: YELLOW, labelKey: 'es' },
  timelineCache: { x: 1050, y: 476, w: 132, h: 66, icon: Zap, tint: RED, labelKey: 'timelineCache' },
  userData: { x: 902, y: 762, w: 124, h: 58, icon: Database, tint: GREEN, labelKey: 'userData' },
  following: { x: 902, y: 862, w: 124, h: 58, icon: Users, tint: GREEN, labelKey: 'following' },
};

type EdgeDef = {
  from: NodeId;
  to: NodeId;
  color: string;
  bi?: boolean;
  dash?: boolean;
  labelKey?: 'https' | 'write' | 'read' | 'cdc' | 'fanoutWrite' | 'fanoutRead' | 'deliver';
  bend?: number; // perpendicular offset in px for a curved edge
  labelDx?: number; // nudge the label horizontally to dodge a node
  labelDy?: number; // nudge the label vertically to dodge a node
};

const EDGES: EdgeDef[] = [
  { from: 'cdn', to: 'client', color: SKY, bend: -26 },
  { from: 'client', to: 'lb', color: ACCENT, bi: true, labelKey: 'https' },
  { from: 'lb', to: 'gateway', color: ACCENT, bi: true },
  { from: 'gateway', to: 'rateLimit1', color: ACCENT },
  { from: 'rateLimit1', to: 'tweet', color: ACCENT },
  { from: 'gateway', to: 'cache', color: ACCENT },
  { from: 'cache', to: 'tweet', color: MUTED, dash: true },
  { from: 'gateway', to: 'rateLimit2', color: ACCENT },
  { from: 'rateLimit2', to: 'reply', color: ACCENT },
  { from: 'gateway', to: 'search', color: ACCENT, bi: true },
  { from: 'gateway', to: 'timeline', color: ACCENT, bi: true },
  { from: 'gateway', to: 'profile', color: ACCENT },
  { from: 'tweet', to: 'tweetContent', color: GREEN, bi: true },
  { from: 'tweet', to: 'media', color: SKY },
  { from: 'tweet', to: 'mq', color: VIOLET },
  { from: 'mq', to: 'fanout', color: VIOLET, labelKey: 'fanoutWrite', labelDy: -50 },
  { from: 'fanout', to: 'timelineCache', color: VIOLET },
  { from: 'tweetContent', to: 'es', color: YELLOW, dash: true, labelKey: 'cdc', bend: 80 },
  { from: 'reply', to: 'replies', color: GREEN },
  { from: 'search', to: 'es', color: YELLOW, bi: true },
  { from: 'timeline', to: 'timelineCache', color: RED, bi: true, labelKey: 'fanoutRead', bend: 150 },
  { from: 'timeline', to: 'following', color: GREEN },
  { from: 'profile', to: 'userData', color: GREEN, bi: true },
  { from: 'profile', to: 'following', color: GREEN, bi: true },
  { from: 'profile', to: 'auth', color: MUTED, bi: true },
  { from: 'media', to: 'cdn', color: SKY, labelKey: 'deliver', bend: -150 },
];

/** Trim a segment endpoint to the boundary of node `n` (toward point p/q). */
function boundary(n: NodeDef, tx: number, ty: number, gap = 7) {
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

/**
 * TwBlueprint — the fixed, macro "everything at once" architecture map that
 * sits at the top of the lesson. Non-interactive on purpose: it is the single
 * reference picture; every animated panel below zooms into one of these paths.
 */
export function TwBlueprint({ locale }: { locale: Locale }) {
  const c = twContent[locale].blueprint;

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        {/* legend */}
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
          <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-wide text-muted/70">
            {c.scrollHint} →
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface/60">
          <div className="relative mx-auto" style={{ width: W, height: H }}>
            <svg
              width={W}
              height={H}
              className="absolute inset-0"
              aria-hidden
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker
                  id="tw-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
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

                return (
                  <g key={i}>
                    <path
                      d={d}
                      fill="none"
                      stroke={e.color}
                      strokeWidth={2}
                      strokeDasharray={e.dash ? '6 4' : undefined}
                      strokeLinecap="round"
                      markerEnd="url(#tw-arrow)"
                      markerStart={e.bi ? 'url(#tw-arrow)' : undefined}
                      opacity={e.color === MUTED ? 0.55 : 0.9}
                    />
                    {e.labelKey && (
                      <text
                        x={lx + (e.labelDx ?? 0)}
                        y={ly + (e.labelDy ?? 0)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fill: e.color === MUTED ? MUTED : e.color,
                          stroke: 'rgb(var(--surface))',
                          strokeWidth: 4,
                          paintOrder: 'stroke',
                          fontSize: 13,
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
              return (
                <div
                  key={id}
                  className="absolute z-[2] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-xl border bg-surface text-center shadow-sm"
                  style={{ left: n.x, top: n.y, width: n.w, height: n.h, borderColor: `color-mix(in srgb, ${tint} 55%, rgb(var(--border)))` }}
                >
                  <Icon className="mb-0.5 h-4 w-4" style={{ color: tint }} aria-hidden />
                  <span className="px-1 text-[0.72rem] font-semibold leading-tight text-fg">
                    {c.nodes[n.labelKey]}
                  </span>
                  {n.sub && (
                    <span className="mt-0.5 font-mono text-[0.58rem] text-muted">{c.nodes.clientSub}</span>
                  )}
                  {id === 'lb' && (
                    <span className="mt-0.5 font-mono text-[0.54rem] text-muted">{c.lbNote}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">{c.note}</p>
      </TwStage>
    </div>
  );
}
