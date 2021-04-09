import {uniqWith, pick, isEqual} from 'lodash';
import {StatePkt, CytoGraph, CytoNode} from 'cosmos-lib/src/types';

function generate(statePkt: StatePkt, vpn: string, type: 'load' | 'filter') {
  const graph: CytoGraph = {
    nodes: {},
    edges: {},
    type,
  };

  const uniqueRouterRd = uniqWith(
    statePkt.events.map(x => pick(x, ['bmp_router', 'rd'])),
    isEqual
  );

  const bmpRouterRdMap: Record<string, (string | null)[]> = {};
  for (const r of uniqueRouterRd) {
    if (!bmpRouterRdMap[r.bmp_router]) bmpRouterRdMap[r.bmp_router] = [];
    bmpRouterRdMap[r.bmp_router].push(r.rd);
  }

  const vpnNode = {
    id: vpn,
    label: vpn,
    color: 'accent',
  };

  graph.nodes[vpnNode.id] = vpnNode;

  for (const bmpRouter in bmpRouterRdMap) {
    const children: string[] = [];
    for (const rd of bmpRouterRdMap[bmpRouter]) {
      const nodeRdKey = `${bmpRouter}_${rd}`;
      graph.nodes[nodeRdKey] = {
        id: nodeRdKey,
        label: `${rd}`,
        visible: false,
      } as CytoNode;
      children.push(nodeRdKey);

      const edgeRdKey = `${bmpRouter}->${rd}`;
      graph.edges[edgeRdKey] = {
        id: edgeRdKey,
        src: bmpRouter,
        dst: nodeRdKey,
      };
    }

    graph.nodes[bmpRouter] = {
      id: bmpRouter,
      label: bmpRouter,
      children,
    };

    const edgeKey = `${bmpRouter}->${vpnNode.id}`;
    graph.edges[edgeKey] = {
      id: edgeKey,
      src: bmpRouter,
      dst: vpnNode.id,
    };
  }

  return graph;
}

export default generate;
