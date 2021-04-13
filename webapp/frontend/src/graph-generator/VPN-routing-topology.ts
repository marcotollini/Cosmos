import {uniqWith, pick, isEqual} from 'lodash';
import {StatePkt, CytoGraph, CytoNode} from 'cosmos-lib/src/types';

function generate(statePkt: StatePkt, vpn: string, type: 'load' | 'filter') {
  const outpkt = uniqWith(
    statePkt.events
      .filter(x => x.is_out === true && x.rd !== null)
      .map(x => pick(x, ['bmp_router', 'rd', 'bgp_nexthop', 'peer_ip'])),
    isEqual
  );

  console.log(outpkt);

  const inpkt = uniqWith(
    statePkt.events
      .filter(x => x.is_in === true && x.rd !== null)
      .map(x => pick(x, ['bmp_router', 'rd', 'bgp_nexthop', 'peer_ip'])),
    isEqual
  );

  const matchpkt = inpkt
    .map(x => {
      for (const y of outpkt) {
        if (x.rd === y.rd && x.bgp_nexthop === y.bgp_nexthop)
          return new Set([x.bmp_router, y.bmp_router]);
      }
      return null;
    })
    .filter(x => x !== null);

  const pairs = uniqWith(matchpkt, isEqual).filter(
    x => x !== null && !x.has('192.0.2.52') && x.size === 2
  );

  const graph: CytoGraph = {
    nodes: {},
    edges: {},
    type,
  };

  for (const pair of pairs) {
    if (pair === null) continue;
    const pairArr = [...pair];
    if (!graph.nodes[pairArr[0]]) {
      graph.nodes[pairArr[0]] = {
        id: pairArr[0],
        label: pairArr[0],
        visible: true,
      } as CytoNode;
    }
    if (!graph.nodes[pairArr[1]]) {
      graph.nodes[pairArr[1]] = {
        id: pairArr[1],
        label: pairArr[1],
        visible: true,
      } as CytoNode;
    }

    const edgeKey = `${pairArr[0]}-${pairArr[1]}`;
    graph.edges[edgeKey] = {
      id: edgeKey,
      src: pairArr[0],
      dst: pairArr[1],
    };
  }

  return graph;
}

export default generate;
