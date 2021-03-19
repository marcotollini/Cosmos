// import {BMPDump} from '../db/types';
import {BMPDump} from '../db/types';

function nodeKeyGenerator(elem: BMPDump) {
  return `${elem.bmp_router}-${elem.rd}`;
}

function graphFromListDump(dumpList: BMPDump[]) {
  const graph: {
    [key: string]: {
      [key: string]: {
        inPre?: BMPDump;
        inPost?: BMPDump;
        outPre?: BMPDump;
        outPost?: BMPDump;
        loc?: BMPDump;
      };
    };
  } = {};
  for (const dumpElem of dumpList) {
    const nodeKey = nodeKeyGenerator(dumpElem);
    if (!graph[nodeKey]) graph[nodeKey] = {};
    const prefix = dumpElem.ip_prefix;
    if (!graph[nodeKey][prefix]) graph[nodeKey][prefix] = {};

    if (dumpElem.is_in && !dumpElem.is_post)
      graph[nodeKey][prefix].inPre = dumpElem;
    else if (dumpElem.is_in && dumpElem.is_post)
      graph[nodeKey][prefix].inPost = dumpElem;
    else if (dumpElem.is_out && !dumpElem.is_post)
      graph[nodeKey][prefix].outPre = dumpElem;
    else if (dumpElem.is_out && dumpElem.is_post)
      graph[nodeKey][prefix].outPost = dumpElem;
    else if (dumpElem.is_loc) graph[nodeKey][prefix].loc = dumpElem;
    else console.log('Unknown', dumpElem);
  }

  return graph;
}

export {graphFromListDump};
