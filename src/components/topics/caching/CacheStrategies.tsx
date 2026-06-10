'use client';

import { Database, Globe, Server, Zap } from 'lucide-react';
import { FlowPlayer, type FlowPlayerStep, type FlowPlayerMode } from '@/components/flow/FlowPlayer';
import { type FlowNode, type FlowEdge, type EdgeKind } from '@/components/flow/FlowDiagram';
import { type Locale } from '@/i18n/routing';
import { cacheContent, type CacheNodeId, type CacheStratMode } from './content';

const iconById: Record<CacheNodeId, FlowNode['icon']> = {
  client: Globe,
  backend: Server,
  cache: Zap,
  database: Database,
};
const colById: Record<CacheNodeId, number> = {
  client: 0,
  backend: 1,
  cache: 2,
  database: 2,
};

const edges: FlowEdge[] = [
  { from: 'client', to: 'backend' },
  { from: 'backend', to: 'cache' },
  { from: 'backend', to: 'database' },
  { from: 'cache', to: 'database' },
];

type Struct = {
  edge: { from: CacheNodeId; to: CacheNodeId; kind: EdgeKind };
  packet: string;
};

const flows: Record<CacheStratMode, Struct[]> = {
  'cache-aside': [
    { edge: { from: 'client', to: 'backend', kind: 'request' }, packet: 'get' },
    { edge: { from: 'backend', to: 'cache', kind: 'request' }, packet: 'check' },
    { edge: { from: 'cache', to: 'backend', kind: 'referral' }, packet: 'miss' },
    { edge: { from: 'backend', to: 'database', kind: 'request' }, packet: 'read' },
    { edge: { from: 'database', to: 'backend', kind: 'response' }, packet: 'data' },
    { edge: { from: 'backend', to: 'cache', kind: 'replicate' }, packet: 'store' },
    { edge: { from: 'backend', to: 'client', kind: 'response' }, packet: 'data' },
  ],
  'read-through': [
    { edge: { from: 'client', to: 'backend', kind: 'request' }, packet: 'get' },
    { edge: { from: 'backend', to: 'cache', kind: 'request' }, packet: 'read' },
    { edge: { from: 'cache', to: 'database', kind: 'request' }, packet: 'miss' },
    { edge: { from: 'database', to: 'cache', kind: 'response' }, packet: 'data' },
    { edge: { from: 'cache', to: 'backend', kind: 'response' }, packet: 'data' },
    { edge: { from: 'backend', to: 'client', kind: 'response' }, packet: 'data' },
  ],
  'write-through': [
    { edge: { from: 'client', to: 'backend', kind: 'request' }, packet: 'write' },
    { edge: { from: 'backend', to: 'cache', kind: 'request' }, packet: 'write' },
    { edge: { from: 'cache', to: 'database', kind: 'replicate' }, packet: 'write' },
    { edge: { from: 'database', to: 'cache', kind: 'response' }, packet: 'ok' },
    { edge: { from: 'cache', to: 'backend', kind: 'response' }, packet: 'ok' },
    { edge: { from: 'backend', to: 'client', kind: 'response' }, packet: 'ok' },
  ],
};

const MODES: CacheStratMode[] = ['cache-aside', 'read-through', 'write-through'];

export function CacheStrategies({ locale }: { locale: Locale }) {
  const c = cacheContent[locale].strategies;

  const nodes: FlowNode[] = (Object.keys(c.nodes) as CacheNodeId[]).map((id) => ({
    id,
    label: c.nodes[id].label,
    sublabel: c.nodes[id].sublabel,
    icon: iconById[id],
    col: colById[id],
  }));

  const stepsByMode: Record<string, FlowPlayerStep[]> = Object.fromEntries(
    MODES.map((m) => [
      m,
      flows[m].map((s, i) => ({
        edge: s.edge,
        packet: c.packets[s.packet],
        title: c.modes[m].steps[i].title,
        text: c.modes[m].steps[i].text,
      })),
    ]),
  );

  const modes: FlowPlayerMode[] = MODES.map((m) => ({
    id: m,
    label: c.modes[m].label,
    hint: c.modes[m].hint,
  }));

  const nodeDetails = Object.fromEntries(
    (Object.keys(c.nodes) as CacheNodeId[]).map((id) => [id, c.nodes[id].detail]),
  );

  return (
    <div className="not-prose">
      <h3 className="mb-4 font-display text-xl font-semibold text-fg">{c.ui.diagramTitle}</h3>
      <FlowPlayer
        nodes={nodes}
        edges={edges}
        stepsByMode={stepsByMode}
        modes={modes}
        initialMode="cache-aside"
        showTopology={false}
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
