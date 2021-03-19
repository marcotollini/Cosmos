import Database from '../Database';
import {Knex} from 'knex';
import {BMPDump, BMPEvent} from '../types';

interface BMPEventExtended extends BMPEvent {
  timestamp_search: number;
}

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
    return this.knex<BMPDump>('dump')
      .distinctOn('bmp_router', 'rd')
      .select('seq', 'bmp_router', 'rd', 'timestamp')
      .where('timestamp', '<=', timestamp)
      .where('timestamp', '>=', timestamp - this.timeBetweenDumps)
      .where('bmp_msg_type', '=', 'route_monitor')
      .whereRaw('comms @> ?', [JSON.stringify(vpn)])
      .orderBy(['bmp_router', 'rd', {column: 'timestamp', order: 'DESC'}]);
  }

  // returns the state of a VRF of a vpn
  stateVrfVpnDump(table_name: string, timestamp: number, vpn: string) {
    const knex = this.knex<BMPDump>('dump')
      .select('dump.*')
      .rightJoin(this.knex.ref(table_name).as('i'), function () {
        this.on('dump.bmp_router', '=', 'i.bmp_router')
          .on('dump.rd', '=', 'i.rd')
          .on('dump.seq', '=', 'i.seq');
      })
      .where('dump.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('dump.comms @> ?', [JSON.stringify(vpn)])
      .where('dump.timestamp', '>=', timestamp - this.timeBetweenDumps)
      .where('dump.timestamp', '<=', timestamp)
      .orderBy('dump.timestamp', 'asc');

    return knex;
  }

  stateVrfVpnEvent(table_name: string, timestamp: number, vpn: string) {
    const knex = this.knex<BMPDump>('event')
      .select('event.*')
      .leftJoin(this.knex.ref(table_name).as('i'), function () {
        this.on('event.bmp_router', '=', 'i.bmp_router');
        this.on('event.rd', '=', 'i.rd');
      })
      .where('event.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('event.comms @> ?', [JSON.stringify(vpn)])
      .where('event.timestamp_arrival', '>=', timestamp - this.timeBetweenDumps)
      .where('event.timestamp_arrival', '<=', timestamp)
      .where(function () {
        this.whereNull('i.timestamp').orWhereRaw(
          '"event"."timestamp_arrival" > "i"."timestamp"'
        );
      })
      .orderBy('event.timestamp_arrival', 'asc');

    return knex;
  }

  async stateVpn(timestamp: number, vpn: string) {
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

      console.log(
        await this.knex(temp_table_name).select('*').transacting(trx)
      );

      const stateDump = await this.stateVrfVpnDump(
        temp_table_name,
        timestamp,
        vpn
      ).transacting(trx);

      const stateEvent = await this.stateVrfVpnEvent(
        temp_table_name,
        timestamp,
        vpn
      ).transacting(trx);

      await trx.commit();
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }
}

export default PGDatabase;
export {BMPDump, BMPEvent};
