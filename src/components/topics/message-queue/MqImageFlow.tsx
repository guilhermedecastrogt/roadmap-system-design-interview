'use client';

import { HardDrive, Layers, Server, UploadCloud } from 'lucide-react';
import { FlowPlayer, type FlowPlayerStep } from '@/components/flow/FlowPlayer';
import { type FlowNode, type FlowEdge, type EdgeKind } from '@/components/flow/FlowDiagram';
import { type Locale } from '@/i18n/routing';
import { messageQueueContent, type MqImageNodeId } from './content';

const iconById: Record<MqImageNodeId, FlowNode['icon']> = {
  serverA: UploadCloud,
  bucket: HardDrive,
  queue: Layers,
  serverB: Server,
};
const colById: Record<MqImageNodeId, number> = {
  serverA: 0,
  bucket: 1,
  queue: 1,
  serverB: 2,
};

const edges: FlowEdge[] = [
  { from: 'serverA', to: 'bucket' },
  { from: 'serverA', to: 'queue' },
  { from: 'queue', to: 'serverB' },
  { from: 'serverB', to: 'bucket' },
];

type Struct = {
  edge?: { from: MqImageNodeId; to: MqImageNodeId; kind: EdgeKind };
  focus?: MqImageNodeId;
  packet: string;
};

const struct: Struct[] = [
  { edge: { from: 'serverA', to: 'bucket', kind: 'request' }, packet: 'image' },
  { edge: { from: 'bucket', to: 'serverA', kind: 'response' }, packet: 'stored' },
  { edge: { from: 'serverA', to: 'queue', kind: 'request' }, packet: 'msg' },
  { edge: { from: 'queue', to: 'serverB', kind: 'response' }, packet: 'read' },
  { edge: { from: 'serverB', to: 'bucket', kind: 'request' }, packet: 'fetch' },
  { edge: { from: 'bucket', to: 'serverB', kind: 'response' }, packet: 'bytes' },
  { focus: 'serverB', packet: 'compress' },
];

export function MqImageFlow({ locale }: { locale: Locale }) {
  const c = messageQueueContent[locale].imageFlow;

  const nodes: FlowNode[] = (Object.keys(c.nodes) as MqImageNodeId[]).map((id) => ({
    id,
    label: c.nodes[id].label,
    sublabel: c.nodes[id].sublabel,
    icon: iconById[id],
    col: colById[id],
  }));

  const steps: FlowPlayerStep[] = struct.map((s, i) => ({
    edge: s.edge,
    focus: s.focus,
    packet: c.packets[s.packet],
    title: c.steps[i].title,
    text: c.steps[i].text,
  }));

  const nodeDetails = Object.fromEntries(
    (Object.keys(c.nodes) as MqImageNodeId[]).map((id) => [id, c.nodes[id].detail]),
  );

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mb-4 mt-1 max-w-3xl text-sm text-muted">{c.subtitle}</p>
      <FlowPlayer
        nodes={nodes}
        edges={edges}
        stepsByMode={{ main: steps }}
        modes={[{ id: 'main', label: c.title, hint: c.hint }]}
        showTopology={false}
        nodeDetails={nodeDetails}
        labels={c.ui}
      />
    </div>
  );
}
