import {sql, StatementCancelledError, ListSqlTokenType} from 'slonik';

import Query from '../Query';

class BMPState extends Query {
  timestamp: Date;
  vpn: string;
  timestampUnix: number;
  distinctEventKey: string[];
  sharedColumns: string[];
  constructor(timestamp: Date, vpn: string) {
    super();
    this.timestamp = timestamp;
    this.vpn = vpn;
    this.timestampUnix = Math.round(this.timestamp.getTime() / 1000);

    this.distinctEventKey = [
      'bmp_router',
      'rd',
      'peer_ip',
      'ip_prefix',
      'bgp_nexthop',
      'is_loc',
      'is_in',
      'is_out',
      'is_post',
    ];

    this.sharedColumns = [
      'seq',
      'timestamp',
      'timestamp_arrival',
      'timestamp_database',
      'event_type',
      'bmp_msg_type',
      'bmp_router',
      'bmp_router_port',
      'writer_id',
      'local_ip',
      'local_port',
      'peer_ip',
      'remote_port',
      'peer_asn',
      'peer_type',
      'peer_type_str',
      'is_in',
      'is_filtered',
      'is_loc',
      'is_post',
      'is_out',
      'rd',
      'bgp_id',
      'log_type',
      'afi',
      'safi',
      'ip_prefix',
      'bgp_nexthop',
      'as_path',
      'as_path_id',
      'comms',
      'ecomms',
      'lcomms',
      'origin',
      'local_pref',
      'med',
      'aigp',
      'psid_li',
      'label',
      'peer_tcp_port',
    ];
  }

  raw() {
    const dumpTable = sql.identifier(['dump']);
    const eventTable = sql.identifier(['event']);

    const distinctEventKeyEtSql = sql.join(
      this.distinctEventKey.map(x => sql.identifier(['et', x])),
      sql`, `
    );
    const distinctEventKeySql = sql.join(
      this.distinctEventKey.map(x => sql.identifier([x])),
      sql`, `
    );

    const sharedColumnsEventSql = sql.join(
      this.distinctEventKey.map(x => sql.identifier(['et', x])),
      sql`, `
    );

    const sharedColumnsDumpSql = sql.join(
      this.distinctEventKey.map(x => sql.identifier(['dp', x])),
      sql`, `
    );

    const sharedColumnsUnionSql = sql.join(
      this.distinctEventKey.map(x => sql.identifier(['unionstate', x])),
      sql`, `
    );

    return sql`
      WITH ${sql.identifier(['dumpinteresting'])} AS (
        SELECT *
        FROM ${dumpTable}
        WHERE bmp_msg_type = ${'route_monitor'}
        AND comms @> ${sql.json(this.vpn)}
        AND timestamp > ${this.timestampUnix - this.timeBetweenDumps}
        AND timestamp <= ${this.timestampUnix}
      ), ${sql.identifier(['rdlist'])} AS (
        SELECT DISTINCT ON (bmp_router, rd) bmp_router, rd, seq, timestamp
        FROM ${sql.identifier(['dumpinteresting'])}
        ORDER BY bmp_router, rd, timestamp DESC
      ), ${sql.identifier(['dumpstate'])} AS (
        SELECT ${sharedColumnsDumpSql}, dp.timestamp AS timestamp_comparable
        FROM ${sql.identifier(['dumpinteresting'])} AS dp
        RIGHT JOIN ${sql.identifier(['rdlist'])} AS tmpdp
        ON dp.bmp_router = tmpdp.bmp_router
        AND dp.rd is not distinct from tmpdp.rd
        AND dp.seq = tmpdp.seq
        ORDER BY dp.timestamp DESC
      ), ${sql.identifier(['eventstate'])} AS (
        SELECT DISTINCT ON (${distinctEventKeyEtSql}) ${sharedColumnsEventSql}, et.timestamp_arrival AS timestamp_comparable
        FROM ${eventTable} AS et
        LEFT JOIN ${sql.identifier(['rdlist'])} as tmpdp
        ON et.bmp_router = tmpdp.bmp_router
        AND et.rd is not distinct from tmpdp.rd
        WHERE et.bmp_msg_type = ${'route_monitor'}
        AND et.comms @> ${sql.json(this.vpn)}
        AND et.timestamp_arrival > ${this.timestampUnix - this.timeBetweenDumps}
        AND et.timestamp_arrival <= ${this.timestampUnix}
        ORDER BY ${distinctEventKeyEtSql}, et.timestamp_arrival DESC
      ), unionstate AS (
        SELECT *
        FROM ${sql.identifier(['eventstate'])}
        UNION
        SELECT *
        FROM ${sql.identifier(['dumpstate'])}
      )
      SELECT DISTINCT ON (${distinctEventKeySql}) ${sharedColumnsUnionSql}
      FROM ${sql.identifier(['unionstate'])}
      ORDER BY ${distinctEventKeySql}, timestamp_comparable DESC
    `;
  }

  async execute(): Promise<Record<string, unknown>[]> {
    console.log(this.raw());
    const rows = (await this.executeQuery()) as Record<string, unknown>[];

    return rows;
  }

  async cancel() {
    if (this.pid !== null) {
      await this.cancelPid(this.pid);
      return true;
    }
    return false;
  }
}

export default BMPState;
