'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Database,
  Globe,
  Network,
  ServerCog,
} from 'lucide-react';
import {
  FlowPlayer,
  type FlowPlayerStep,
  type FlowPlayerMode,
} from '@/components/flow/FlowPlayer';
import { type FlowNode, type FlowEdge, type EdgeKind } from '@/components/flow/FlowDiagram';
import { type Locale } from '@/i18n/routing';
import { dnsContent, type DnsNodeId } from './content';

const iconById: Record<DnsNodeId, FlowNode['icon']> = {
  browser: Globe,
  resolver: ServerCog,
  root: Network,
  tld: Building2,
  auth: Database,
};
const colById: Record<DnsNodeId, number> = {
  browser: 0,
  resolver: 1,
  root: 2,
  tld: 2,
  auth: 2,
};

const edges: FlowEdge[] = [
  { from: 'browser', to: 'resolver' },
  { from: 'resolver', to: 'root' },
  { from: 'resolver', to: 'tld' },
  { from: 'resolver', to: 'auth' },
];

type Struct = {
  edge?: { from: DnsNodeId; to: DnsNodeId; kind: EdgeKind };
  focus?: DnsNodeId;
  packet?: 'query' | 'referral' | 'ip';
  visits?: DnsNodeId[];
};

const iterativeStruct: Struct[] = [
  { edge: { from: 'browser', to: 'resolver', kind: 'request' }, packet: 'query' },
  { edge: { from: 'resolver', to: 'root', kind: 'request' }, packet: 'query' },
  { edge: { from: 'root', to: 'resolver', kind: 'referral' }, packet: 'referral' },
  { edge: { from: 'resolver', to: 'tld', kind: 'request' }, packet: 'query' },
  { edge: { from: 'tld', to: 'resolver', kind: 'referral' }, packet: 'referral' },
  { edge: { from: 'resolver', to: 'auth', kind: 'request' }, packet: 'query' },
  { edge: { from: 'auth', to: 'resolver', kind: 'response' }, packet: 'ip' },
  { edge: { from: 'resolver', to: 'browser', kind: 'response' }, packet: 'ip' },
];

const recursiveStruct: Struct[] = [
  { edge: { from: 'browser', to: 'resolver', kind: 'request' }, packet: 'query' },
  { focus: 'resolver', visits: ['root', 'tld', 'auth'] },
  { edge: { from: 'resolver', to: 'browser', kind: 'response' }, packet: 'ip' },
];

export function DnsExperience({ locale }: { locale: Locale }) {
  const c = dnsContent[locale];

  const nodes: FlowNode[] = (Object.keys(c.nodes) as DnsNodeId[]).map((id) => ({
    id,
    label: c.nodes[id].label,
    sublabel: c.nodes[id].sublabel,
    icon: iconById[id],
    col: colById[id],
  }));

  const merge = (struct: Struct[], text: { title: string; text: string }[]): FlowPlayerStep[] =>
    struct.map((s, i) => ({
      ...s,
      packet: s.packet ? c.packets[s.packet] : undefined,
      title: text[i].title,
      text: text[i].text,
    }));

  const stepsByMode = {
    iterative: merge(iterativeStruct, c.iterative),
    recursive: merge(recursiveStruct, c.recursive),
  };

  const modes: FlowPlayerMode[] = [
    { id: 'iterative', label: c.ui.iterative, hint: c.ui.iterativeHint },
    { id: 'recursive', label: c.ui.recursive, hint: c.ui.recursiveHint },
  ];

  const nodeDetails = Object.fromEntries(
    (Object.keys(c.nodes) as DnsNodeId[]).map((id) => [id, c.nodes[id].detail]),
  );

  return (
    <div className="not-prose">
      {/* Translator hero */}
      <div className="mb-5 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface/50 p-5 text-center sm:flex-row sm:justify-center sm:gap-5 sm:text-left">
        <span className="rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm font-semibold text-fg">
          {c.translator.from}
        </span>
        <motion.span
          animate={{ x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-accent"
        >
          <ArrowRight className="h-5 w-5" aria-hidden />
        </motion.span>
        <span className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-sm font-semibold text-accent">
          {c.translator.to}
        </span>
        <span className="max-w-xs text-xs text-muted sm:ml-2">{c.translator.note}</span>
      </div>

      <FlowPlayer
        nodes={nodes}
        edges={edges}
        stepsByMode={stepsByMode}
        modes={modes}
        initialMode="iterative"
        nodeDetails={nodeDetails}
        labels={{
          start: c.ui.start,
          replay: c.ui.replay,
          step: c.ui.step,
          of: c.ui.of,
          prev: c.ui.prev,
          next: c.ui.next,
          tapHint: c.ui.tapHint,
          diagramTitle: c.ui.diagramTitle,
        }}
      />
    </div>
  );
}
