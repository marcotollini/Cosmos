import {sql} from 'slonik';

import {default as Query, slonikSql} from '../Query';
import {
  default as PeerUpStateInterface,
  returnType,
} from '../../query-interface/PeerUpState';

type queryReturnType = Record<string, unknown>[];

class PeerUpState extends Query implements PeerUpStateInterface {
  timestamp: Date;
  timestampUnix: number;
  distinctEventKey: string[];
  sharedColumns: string[];
  timeBetweenDumps = 24 * 60 * 60;
  constructor(timestamp: Date) {
    super();
    this.timestamp = timestamp;
    this.timestampUnix = Math.round(this.timestamp.getTime() / 1000);

    this.distinctEventKey = [
      'bmp_router',
      'rd',
      'local_ip',
      'peer_ip',
      'bgp_id',
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
      this.sharedColumns.map(x => sql.identifier(['et', x])),
      sql`, `
    );

    const sharedColumnsDumpSql = sql.join(
      this.sharedColumns.map(x => sql.identifier(['dp', x])),
      sql`, `
    );

    const sharedColumnsUnionSql = sql.join(
      this.sharedColumns.map(x => sql.identifier(['unionstate', x])),
      sql`, `
    );

    return sql`
      WITH dumpinteresting AS (
        SELECT *
        FROM ${dumpTable}
        WHERE bmp_msg_type = 'peer_up'
        AND timestamp > ${this.timestampUnix - this.timeBetweenDumps}
        AND timestamp <= ${this.timestampUnix}
      ), rdlist AS (
        SELECT DISTINCT ON (bmp_router, rd) bmp_router, rd, seq, timestamp
        FROM dumpinteresting
        ORDER BY bmp_router, rd, timestamp DESC
      ), dumpstate AS (
        SELECT ${sharedColumnsDumpSql}, dp.timestamp AS timestamp_comparable
        FROM dumpinteresting AS dp
        RIGHT JOIN rdlist AS tmpdp
        ON dp.bmp_router = tmpdp.bmp_router
        AND dp.rd is not distinct from tmpdp.rd
        AND dp.seq = tmpdp.seq
        ORDER BY dp.timestamp DESC
      ), eventstate AS (
        SELECT DISTINCT ON (${distinctEventKeyEtSql}) ${sharedColumnsEventSql}, et.timestamp_arrival AS timestamp_comparable
        FROM ${eventTable} AS et
        LEFT JOIN rdlist as tmpdp
        ON et.bmp_router = tmpdp.bmp_router
        AND et.rd is not distinct from tmpdp.rd
        WHERE et.bmp_msg_type = 'peer_up'
        AND et.timestamp_arrival > ${this.timestampUnix - this.timeBetweenDumps}
        AND et.timestamp_arrival <= ${this.timestampUnix}
        ORDER BY ${distinctEventKeyEtSql}, et.timestamp_arrival DESC
      ), unionstate AS (
        SELECT *
        FROM eventstate
        UNION
        SELECT *
        FROM dumpstate
      )
      SELECT DISTINCT ON (${distinctEventKeySql}) ${sharedColumnsUnionSql}
      FROM unionstate
      ORDER BY ${distinctEventKeySql}, timestamp_comparable DESC
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default PeerUpState;
export {returnType, queryReturnType};
