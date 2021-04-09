import {partition} from 'lodash';
import {StatePkt, CytoGraph} from 'cosmos-lib/src/types';

function generate(statePkt: StatePkt, type: 'load' | 'filter') {
  const graph: CytoGraph = {
    nodes: {},
    edges: {},
    type,
  };

  const eventsInOut = statePkt.events.filter(
    x => x.is_in === true || x.is_out === true
  );

  const [eventsIn, eventsOut] = partition(eventsInOut, x => x.is_in === true);

  const rtMap = {};
  for (const eventOut of eventsOut) {
    console.log(eventOut);
  }
}

export default generate;
