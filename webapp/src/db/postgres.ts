const {Pool} = require('pg');
import * as _ from 'lodash';

const pool = new Pool();

interface SelectQuery {
  command: string;
  rowCount: number;
}

interface dumpDistinctQuery extends SelectQuery {
  rows: [
    {
      seq: number;
      bmp_router: string;
      rd: string;
      timestamp: number;
    }
  ];
}

interface eventDistinctQuery extends SelectQuery {
  rows: [
    {
      bmp_router: string;
      rd: string;
      timestamp_search: number;
    }
  ];
}

function jsonStringify(value: string) {
  return () => {
    return JSON.stringify(value);
  };
}

function queryToNumberedParams(query: string) {
  let i = 1;
  while (query.indexOf('$$') !== -1) {
    query = query.replace('$$', '$' + i);
    i++;
  }
  return query;
}

function queryInsertParams(query: string, params: any[]) {
  let i = 0;
  while (query.indexOf('$$') !== -1) {
    let p = params[i];
    console.log(p);
    if (typeof p === 'object' && typeof p.toPostgres === 'function') {
      p = p.toPostgres();
    }
    if (typeof p === 'object') {
      query = query.replace('$$', `'${JSON.stringify(p)}'`);
    } else {
      query = query.replace('$$', `'${p}'`);
    }

    i++;
  }
  return query;
}

// for each bmp_router, rd, gets the last dump: seq, timestamp
// filters on timestamp: < than the provided one, bigger than the min
// dump time (our case, 45 min)
// also, filters on the message type and on the community
function getDumpListOfDistinctRT(
  timestamp: number,
  vpn: string
): dumpDistinctQuery {
  const queryTxt = `
  SELECT DISTINCT ON(bmp_router, rd) seq, bmp_router, rd, timestamp
  FROM dump
  WHERE
    timestamp < $$ AND timestamp >= $$ AND
    bmp_msg_type = $$ AND
    comms @> $$
  ORDER BY bmp_router, rd, timestamp DESC
  `;

  const timestamp_min_dump = timestamp - 45 * 60;
  const params: (string | number | {toPostgres: Function})[] = [
    timestamp,
    timestamp_min_dump,
    'route_monitor',
    {toPostgres: jsonStringify(vpn)},
  ];

  console.log(queryInsertParams(queryTxt, params));

  const query = queryToNumberedParams(queryTxt);
  return pool.query(query, params);
}

function getEventListOfDistinctRT(
  timestamp: number,
  vpn: string
): eventDistinctQuery {
  const queryTxt = `
  SELECT DISTINCT ON(bmp_router, rd) bmp_router, rd
  FROM event
  WHERE
    timestamp_arrival < $$ AND timestamp_arrival >= $$ AND
    bmp_msg_type = $$ AND
    comms @> $$
  `;

  const timestamp_min_dump = timestamp - 45 * 60;
  const params: (string | number | {toPostgres: Function})[] = [
    timestamp,
    timestamp_min_dump,
    'route_monitor',
    {toPostgres: jsonStringify(vpn)},
  ];

  const query = queryToNumberedParams(queryTxt);
  return pool.query(query, params);
}

function getDumpState(
  timestamp: number,
  vpn: string,
  seq: number,
  bmp_router: string,
  rd: string
) {
  let queryTxt = `
  SELECT *
  FROM dump
  WHERE
    timestamp < $$ AND timestamp >= $$ AND
    bmp_msg_type = $$ AND
    seq = $$ AND
    bmp_router = $$ AND
    comms @> $$
  `;

  const timestamp_min_dump = timestamp - 45 * 60;
  const params: (string | number | {toPostgres: Function})[] = [
    timestamp,
    timestamp_min_dump,
    'route_monitor',
    seq,
    bmp_router,
    {toPostgres: jsonStringify(vpn)},
  ];

  if (rd) {
    queryTxt += ' AND rd = $$';
    params.push(rd);
  } else {
    queryTxt += ' AND rd IS NULL';
  }

  const query = queryToNumberedParams(queryTxt);
  return pool.query(query, params);
}

function getEventState(
  timestamp: number,
  timestamp_search: number,
  vpn: string,
  bmp_router: string,
  rd: string
) {
  let queryTxt = `
  SELECT *
  FROM event
  WHERE
    timestamp_arrival > $$ AND timestamp_arrival <= $$ AND
    bmp_msg_type = $$ AND
    bmp_router = $$ AND
    comms @> $$
  `;

  const params: (string | number | {toPostgres: Function})[] = [
    timestamp,
    timestamp_search,
    'route_monitor',
    bmp_router,
    {toPostgres: jsonStringify(vpn)},
  ];

  if (rd) {
    queryTxt += ' AND rd = $$';
    params.push(rd);
  } else {
    queryTxt += ' AND rd IS NULL';
  }

  const query = queryToNumberedParams(queryTxt);
  return pool.query(query, params);
}

async function getState(timestamp: number, vpn: string) {
  const [dumpDistinct, eventDistinct] = await Promise.all([
    getDumpListOfDistinctRT(timestamp, vpn),
    getEventListOfDistinctRT(timestamp, vpn),
  ]);

  const dumpMap = {};
  dumpDistinct.rows.map(x => {
    dumpMap[[x.bmp_router, x.rd]] = x.timestamp;
  });

  for (const event of eventDistinct.rows) {
    if (dumpMap[[event.bmp_router, event.rd]]) {
      event.timestamp_search = dumpMap[[event.bmp_router, event.rd]];
    } else {
      event.timestamp_search = timestamp;
    }
  }

  const dumpStatePromises = [];
  for (const dump of dumpDistinct.rows) {
    dumpStatePromises.push(
      getDumpState(timestamp, vpn, dump.seq, dump.bmp_router, dump.rd)
    );
  }

  const eventStatePromises = [];
  for (const event of eventDistinct.rows) {
    eventStatePromises.push(
      getEventState(
        timestamp,
        event.timestamp_search,
        vpn,
        event.bmp_router,
        event.rd
      )
    );
  }

  // one entry for bmp_router, rd
  const dumpStateResults = await Promise.all(dumpStatePromises);
  const eventStateResults = await Promise.all(eventStatePromises);

  const graph = {};
  for (const router_rd_dist of dumpStateResults) {
    for (const row of router_rd_dist.rows) {
      if (row.is_loc !== null || row.peer_ip === row.bgp_nexthop) continue;
      graph[[row.peer_ip, row.bgp_nexthop]] = row;
    }
  }

  for (const router_rd_dist of eventStateResults) {
    for (const row of router_rd_dist.rows) {
      if (row.is_loc !== null || row.peer_ip === row.bgp_nexthop) continue;
      if (
        graph[[row.peer_ip, row.bgp_nexthop]] &&
        row.timestamp > graph[[row.peer_ip, row.bgp_nexthop]].timestamp
      ) {
        if (row.log_type === 'update') {
          graph[[row.peer_ip, row.bgp_nexthop]] = row;
        } else {
          delete graph[[row.peer_ip, row.bgp_nexthop]];
        }
      }
    }
  }

  // console.log(graph);
}

export {getState};
