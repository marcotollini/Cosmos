import Database from '../Database';
import {Knex} from 'knex';
import {BMPDump, BMPEvent} from '../types';

class PGDatabase extends Database {
  knex: Knex<any, unknown[]>;
  timeBetweenDumps: number;
  constructor(knex: Knex<any, unknown[]>) {
    super();
    this.knex = knex;
    this.timeBetweenDumps = 45 * 60;
  }

  // Return the list of bmp_router, rd which are present in the given VPN
  // from the dump closest to the given timestamp
  distinctVpnDump(timestamp: number, vpn: string): Knex.QueryBuilder {
    return this.knex<BMPDump>(this.knex.ref('dumptest').as('dp'))
      .distinctOn('bmp_router', 'rd')
      .select('seq', 'bmp_router', 'rd', 'timestamp')
      .where('timestamp', '<=', timestamp)
      .where('timestamp', '>=', timestamp - this.timeBetweenDumps)
      .where('bmp_msg_type', '=', 'route_monitor')
      .whereRaw('comms @> ?', [JSON.stringify(vpn)])
      .orderBy(['bmp_router', 'rd', {column: 'timestamp', order: 'DESC'}]);
  }

  // returns the state of a VRF of a vpn
  stateVrfVpnDump(
    table_name: string,
    timestamp: number,
    vpn: string
  ): Knex.QueryBuilder {
    const knex = this.knex<BMPDump>(this.knex.ref('dumptest').as('dp'))
      .select('dp.*')
      .rightJoin(this.knex.ref(table_name).as('tmpdp'), function () {
        this.on('dp.bmp_router', '=', 'tmpdp.bmp_router')
          .on('dp.rd', '=', 'tmpdp.rd')
          .on('dp.seq', '=', 'tmpdp.seq');
      })
      .where('dp.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('dp.comms @> ?', [JSON.stringify(vpn)])
      .where('dp.timestamp', '>=', timestamp - this.timeBetweenDumps)
      .where('dp.timestamp', '<=', timestamp)
      .orderBy('dp.timestamp', 'asc');

    return knex;
  }

  stateVrfVpnEvent(
    table_name: string,
    timestamp: number,
    vpn: string
  ): Knex.QueryBuilder {
    const knex = this.knex<BMPEvent>(this.knex.ref('eventtest').as('et'))
      .select('et.*')
      .leftJoin(this.knex.ref(table_name).as('tmpdp'), function () {
        this.on('et.bmp_router', '=', 'tmpdp.bmp_router');
        this.on('et.rd', '=', 'tmpdp.rd');
      })
      .where('et.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('et.comms @> ?', [JSON.stringify(vpn)])
      .where('et.timestamp_arrival', '>=', timestamp - this.timeBetweenDumps)
      .where('et.timestamp_arrival', '<=', timestamp)
      .where(function () {
        this.whereNull('tmpdp.timestamp').orWhereRaw(
          '"et"."timestamp_arrival" > "tmpdp"."timestamp"'
        );
      })
      .orderBy('et.timestamp_arrival', 'asc');

    return knex;
  }

  async stateVpn(
    timestamp: number,
    vpn: string
  ): Promise<[BMPDump[], BMPEvent[]]> {
    const trx = await this.knex.transaction();
    try {
      const distinctVpnDumpQuery = this.distinctVpnDump(
        timestamp,
        vpn
      ).toString();
      const temp_table_name = 'distdump';
      await this.knex
        .raw(
          `CREATE TEMPORARY TABLE ${temp_table_name} ON COMMIT DROP AS ${distinctVpnDumpQuery}`
        )
        .transacting(trx);

      const stateDump = <BMPDump[]>(
        await this.stateVrfVpnDump(temp_table_name, timestamp, vpn).transacting(
          trx
        )
      );

      const stateEvent = <BMPEvent[]>(
        await this.stateVrfVpnEvent(
          temp_table_name,
          timestamp,
          vpn
        ).transacting(trx)
      );

      await trx.commit();

      return [stateDump, stateEvent];
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }
}

export default PGDatabase;
