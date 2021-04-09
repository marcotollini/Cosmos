import {uniqWith, pick, isEqual} from 'lodash';
import {StatePkt, CytoGraph} from 'cosmos-lib/src/types';

function generate(
  statePkt: StatePkt,
  community: string,
  type: 'load' | 'filter'
) {
  const graph: CytoGraph = {
    nodes: {},
    edges: {},
    type,
  };

  const uniqueRouterRd = uniqWith(
    statePkt.events.map(x => pick(x, ['bmp_router', 'rd'])),
    isEqual
  );

  const nodes = uniqueRouterRd.map(x => {
    return {
      id: `${x.bmp_router}-${x.rd}`,
      bmp_router: x.bmp_router,
      rd: x.rd,
    };
  });

  graph.nodes['community'] = {
    id: 'community',
    label: community,
    color: 'green',
    radius: 10,
    display: true,
  };

  for (const node of nodes) {
    graph.nodes[node.id] = {
      id: node.id,
      label: node.id,
      color: 'blue',
      radius: 10,
      display: true,
    };

    const edgeKey = `${node.id}-community`;
    graph.edges[edgeKey] = {
      id: edgeKey,
      src: node.id,
      dst: 'community',
      color: 'black',
      width: 1,
    };
  }

  return graph;

  // const eventsInOut = statePkt.events.filter(
  //   x => x.is_in === true || x.is_out === true
  // );

  // const [eventsIn, eventsOut] = partition(eventsInOut, x => x.is_in === true);

  // const epMap: Record<string, [string, string | null, string | null][]> = {};
  // for (const eventOut of eventsOut) {
  //   if (eventOut.comms === null) continue;
  //   const endPoints = eventOut.comms.filter(x => x.indexOf('64499') !== -1);
  //   if (endPoints.length === 0) continue;
  //   for (const endPoint of endPoints) {
  //     if (!epMap[endPoint]) epMap[endPoint] = [];
  //     epMap[endPoint].push([
  //       eventOut.bmp_router,
  //       eventOut.rd,
  //       eventOut.peer_ip,
  //     ]);
  //   }
  // }

  // console.log(epMap);
}

export default generate;
