'use client';

import {
  Globe,
  Route,
  Server,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Warehouse,
} from 'lucide-react';
import {
  FlowPlayer,
  type FlowPlayerStep,
} from '@/components/flow/FlowPlayer';
import { type FlowNode, type FlowEdge, type EdgeKind } from '@/components/flow/FlowDiagram';
import { type Locale } from '@/i18n/routing';
import { cdnContent, type CdnNodeId } from './content';

const iconById: Record<CdnNodeId, FlowNode['icon']> = {
  client: Globe,
  routing: Route,
  distribution: Share2,
  scrubbers: ShieldCheck,
  edge: Server,
  origin: Warehouse,
  management: SlidersHorizontal,
};
const colById: Record<CdnNodeId, number> = {
  client: 0,
  management: 0,
  routing: 1,
  scrubbers: 1,
  distribution: 1,
  edge: 2,
  origin: 2,
};

const edges: FlowEdge[] = [
  { from: 'origin', to: 'routing' },
  { from: 'origin', to: 'distribution' },
  { from: 'distribution', to: 'edge' },
  { from: 'client', to: 'routing' },
  { from: 'client', to: 'scrubbers' },
  { from: 'scrubbers', to: 'edge' },
  { from: 'edge', to: 'client' },
  { from: 'management', to: 'routing', dashed: true },
  { from: 'management', to: 'distribution', dashed: true },
];

type Struct = {
  edge?: { from: CdnNodeId; to: CdnNodeId; kind: EdgeKind };
  focus?: CdnNodeId;
  packet?: keyof typeof packetKeys;
};

const packetKeys = {
  register: 1,
  content: 1,
  ask: 1,
  dest: 1,
  request: 1,
  clean: 1,
} as const;

const struct: Struct[] = [
  { edge: { from: 'origin', to: 'routing', kind: 'referral' }, packet: 'register' },
  { edge: { from: 'distribution', to: 'edge', kind: 'replicate' }, packet: 'content' },
  { edge: { from: 'client', to: 'routing', kind: 'request' }, packet: 'ask' },
  { edge: { from: 'routing', to: 'client', kind: 'referral' }, packet: 'dest' },
  { edge: { from: 'client', to: 'scrubbers', kind: 'request' }, packet: 'request' },
  { focus: 'scrubbers' },
  { edge: { from: 'scrubbers', to: 'edge', kind: 'request' }, packet: 'clean' },
  { edge: { from: 'edge', to: 'client', kind: 'response' }, packet: 'content' },
];

export function CdnExperience({ locale }: { locale: Locale }) {
  const c = cdnContent[locale];

  const nodes: FlowNode[] = (Object.keys(c.nodes) as CdnNodeId[]).map((id) => ({
    id,
    label: c.nodes[id].label,
    sublabel: c.nodes[id].sublabel,
    icon: iconById[id],
    col: colById[id],
  }));

  const steps: FlowPlayerStep[] = struct.map((s, i) => ({
    ...s,
    packet: s.packet ? c.packets[s.packet] : undefined,
    title: c.flow[i].title,
    text: c.flow[i].text,
  }));

  const nodeDetails = Object.fromEntries(
    (Object.keys(c.nodes) as CdnNodeId[]).map((id) => [id, c.nodes[id].detail]),
  );

  return (
    <FlowPlayer
      nodes={nodes}
      edges={edges}
      stepsByMode={{ main: steps }}
      modes={[{ id: 'main', label: '', hint: c.ui.flowHint }]}
      initialMode="main"
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
  );
}
