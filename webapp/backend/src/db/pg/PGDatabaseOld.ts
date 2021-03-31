import Database from '../Database';
import {Knex} from 'knex';
import {at, uniqBy} from 'lodash';

import {
  BMPDump,
  BMPEvent,
  VirtualRouter,
  VirtualRouterDump,
  StatePkt,
  EventCount,
} from 'cosmos-lib/src/types';

import {virtualRouterToKey} from '../../utils';

class PGDatabase extends Database {
  knex: Knex<any, unknown[]>;
  eventTableName = 'event';
  dumpTableName = 'dump';

  constructor(knex: Knex<any, unknown[]>) {
    super();
    this.knex = knex;
    // this.timeBetweenDumps = 45 * 60;
  }

  // List of keys to distinguish an event:
  // if the values in two rows it the same, then we can keep the most recent one to
  // produce a correct state
  keyDistinctEvent = [
    'bmp_router',
    'rd',
    'ip_prefix',
    'is_loc',
    'is_in',
    'is_out',
    'is_post',
  ];

  /**
   * Returns a list of VPN active in the given status
   * @param {number} timestamp - The timestamp for which we want to find the VPNs
   * @return {Promise<string[]>} A list of distinct VPN in a promise
   */
  async getDistinctVpn(timestamp: number): Promise<string[]> {
    const query = this.knex
      .select('community')
      .from(
        this.knex
          .select(
            this.knex.raw(
              'distinct(JSONB_ARRAY_ELEMENTS_TEXT("comms")) as community'
            )
          )
          .as('t')
          .from(this.dumpTableName)
          .where('timestamp', '<=', timestamp)
          .where('timestamp', '>', timestamp - this.timeBetweenDumps)
      )
      .where('community', 'like', '64497:%');
    const results = await query;
    const vpns = results.map((x: {community: string}) => x.community);
    return vpns;
  }

  /**
   * Returns the total number of events in a backet of dimension "precision" and limited by startTimestamp and endTimestmap
   * @param {number} startTimestamp - The minimum timestamp for a backet
   * @param {number} endTimestamp - The maximum timestamp for a bucket
   * @param {number} precision - The dimension of each bucket
   * @return {Promise<EventCount[]>} The list of buckets, with the start and end timestamp, and the number of events
   */
  async getEventsCounter(
    startTimestamp: number,
    endTimestamp: number,
    precision: number
  ): Promise<EventCount[]> {
    const query = this.knex.raw(`
    SELECT
      count(*)::integer as count,
      ("timestamp_arrival" / ${precision})::integer*${precision} as "startgroup",
      ("timestamp_arrival" / ${precision})::integer*${precision} + ${precision} as "endgroup"
    FROM ${this.eventTableName}
    WHERE "timestamp_arrival" >= '${startTimestamp}' AND "timestamp_arrival" <= '${endTimestamp}'
    GROUP BY "startgroup"
    ORDER BY "startgroup"
    `);
    console.log('not_approximated', query.toString());

    const buckets: EventCount[] = (await query).rows;
    return buckets;
  }

  /**
   * Returns the total number of events APPROXIMATED in a backet of dimension "precision" and limited by startTimestamp and endTimestmap
   * @param {number} startTimestamp - The minimum timestamp for a backet
   * @param {number} endTimestamp - The maximum timestamp for a bucket
   * @param {number} precision - The dimension of each bucket
   * @return {Promise<EventCount[]>} The list of buckets, with the start and end timestamp, and the approximated number of events
   *  https://wiki.postgresql.org/wiki/Count_estimate
   */
  async getEventsCounterApprox(
    startTimestamp: number,
    endTimestamp: number,
    precision: number
  ): Promise<EventCount[]> {
    let currentTimestamp = Math.floor(startTimestamp / precision) * precision;
    const approxQueries = [];
    while (currentTimestamp < endTimestamp) {
      const start = currentTimestamp;
      const end = Math.min(currentTimestamp + precision, endTimestamp);
      const approxQuery = `SELECT
        count_estimate('SELECT * from ${this.eventTableName} where "timestamp_arrival" > ${start} and "timestamp_arrival" <= ${end}')::integer as count,
        ${start} as "startgroup",
        ${end} as "endgroup"`;
      approxQueries.push(this.knex.raw(approxQuery));
      currentTimestamp += precision;
    }
    const query = this.knex.unionAll(approxQueries);
    console.log('approx', query.toString());
    const buckets: EventCount[] = await query;
    return buckets;
  }

  /**
   * General filter for dump queryes
   * @param {string} vpn - The VPN we want to filter on
   * @param {number} timestmap - The timestamp of the dump we want to generate
   * @return {QueryBuild} A basic query filter, which can be additionally filtered or selected
   */
  private BMPDumpFilter(vpn: string, timestamp: number) {
    const knex = this.knex<BMPDump>(this.knex.ref(this.dumpTableName).as('dp'));
    return knex
      .where('dp.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('"dp"."comms" @> ?', [JSON.stringify(vpn)])
      .where('dp.timestamp', '>=', timestamp - this.timeBetweenDumps)
      .where('dp.timestamp', '<=', timestamp);
  }

  /**
   * General filter for events queryes
   * @param {string} vpn - The VPN we want to filter on
   * @param {number} timestmap - The timestamp of the event we want to generate
   * @return {QueryBuild} A basic query filter, which can be additionally filtered or selected
   */
  private BMPEventFilter(
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ) {
    const knex = this.knex<BMPDump>(
      this.knex.ref(this.eventTableName).as('et')
    );
    return knex
      .where('et.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('"et"."comms" @> ?', [JSON.stringify(vpn)])
      .where('et.timestamp_arrival', '>=', startTimestamp)
      .where('et.timestamp_arrival', '<=', timestamp);
  }

  /**
   * General filter for dump queryes
   * @param {string} vpn - The VPN we want to filter on
   * @param {number} timestmap - The timestamp of the dump we want to generate
   * @return {QueryBuild} A basic query filter, which can be additionally filtered or selected
   */
  private virtualRoutersBMPGeneral(
    table_name: string,
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ) {
    const knex = this.knex(this.knex.ref(table_name).as('table'))
      .distinctOn('bmp_router', 'rd')
      .orderBy(['bmp_router', 'rd', {column: 'timestamp', order: 'DESC'}]);

    return knex
      .where('table.bmp_msg_type', '=', 'route_monitor')
      .whereRaw('"table"."comms" @> ?', [JSON.stringify(vpn)])
      .where('table.timestamp', '>=', startTimestamp)
      .where('table.timestamp', '<=', timestamp);
  }

  // Select the given dump table, filters it, and distinct on the
  // properties to calc the virtual routers
  private virtualRoutersBMPDump(
    vpn: string,
    timestamp: number
  ): Knex.QueryBuilder<VirtualRouterDump> {
    return this.virtualRoutersBMPGeneral(
      this.dumpTableName,
      vpn,
      timestamp,
      timestamp - this.timeBetweenDumps
    ).select('bmp_router', 'rd', 'seq', 'timestamp');
  }

  // Select the given event table, filters it, and distinct on the
  // properties to calc the virtual routers
  private virtualRoutersBMPEvent(
    vpn: string,
    timestamp: number,
    startTimestmap: number,
    excludeVR?: VirtualRouter[]
  ): Knex.QueryBuilder<VirtualRouter> {
    let knex = this.virtualRoutersBMPGeneral(
      this.eventTableName,
      vpn,
      timestamp,
      startTimestmap
    ).select('bmp_router', 'rd', 'timestamp');

    if (excludeVR) {
      knex = knex.whereNot(function () {
        for (const virtualRouter of excludeVR) {
          this.orWhere(function () {
            this.where('bmp_router', virtualRouter.bmp_router);
            this.where('rd', virtualRouter.rd);
          });
        }
      });
    }

    return knex;
  }

  // given the list of dump virtual routers as a table
  // get the dump of each vr
  private getBMPDumpFromTmp(
    vr_table_name: string,
    vpn: string,
    timestamp: number
  ): Knex.QueryBuilder {
    const knex = this.BMPDumpFilter(vpn, timestamp)
      .select('dp.*')
      .rightJoin(this.knex.ref(vr_table_name).as('tmpdp'), function () {
        this.on('dp.bmp_router', '=', 'tmpdp.bmp_router')
          .on('dp.rd', '=', 'tmpdp.rd')
          .on('dp.seq', '=', 'tmpdp.seq');
      })
      .orderBy('dp.timestamp', 'desc');

    return knex;
  }

  // given the list of dump virtual routers as a table
  // get the event of each vr in the table, and of the routers
  // not in the vr table. It uses the dump vr to select only the most
  // recent data
  private getBMPUpgradeFromVRDump(
    temp_table_name: string,
    vpn: string,
    timestamp: number
  ): Knex.QueryBuilder {
    const knex = this.BMPEventFilter(
      vpn,
      timestamp,
      timestamp - this.timeBetweenDumps
    )
      .select('et.*')
      .distinctOn(this.keyDistinctEvent)
      .leftJoin(this.knex.ref(temp_table_name).as('tmpdp'), function () {
        this.on('et.bmp_router', '=', 'tmpdp.bmp_router');
        this.on('et.rd', '=', 'tmpdp.rd');
      })
      .where(function () {
        this.whereNull('tmpdp.timestamp').orWhereRaw(
          '"et"."timestamp_arrival" > "tmpdp"."timestamp"'
        );
      })
      .orderBy([...this.keyDistinctEvent, 'et.timestamp_arrival']);

    return knex;
  }

  async getBMPState(vpn: string, timestamp: number): Promise<StatePkt> {
    const trx = await this.knex.transaction();
    try {
      const VRDumpQuery = this.virtualRoutersBMPDump(vpn, timestamp).toString();
      const temp_table_name = 'distdump';
      await this.knex
        .raw(
          `CREATE TEMPORARY TABLE ${temp_table_name} ON COMMIT DROP AS ${VRDumpQuery}`
        )
        .transacting(trx);

      const dumpQuery: BMPDump[] = await this.getBMPDumpFromTmp(
        temp_table_name,
        vpn,
        timestamp
      ).transacting(trx);

      const upgradeQuery: BMPEvent[] = await this.getBMPUpgradeFromVRDump(
        temp_table_name,
        vpn,
        timestamp
      ).transacting(trx);

      await trx.commit();

      const eventsDistict: (BMPDump | BMPEvent)[] = uniqBy(
        [...upgradeQuery, ...dumpQuery],
        e => {
          return at(e as any, this.keyDistinctEvent).join('-');
        }
      );

      const statePkt: StatePkt = {
        timestamp,
        type: 'state',
        events: eventsDistict,
      };

      return statePkt;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }

  async getBMPUpgrade(
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ): Promise<StatePkt> {
    const query = this.BMPEventFilter(vpn, timestamp, startTimestamp)
      .select('et.*')
      .distinctOn(...this.keyDistinctEvent)
      .orderBy([
        ...this.keyDistinctEvent,
        {column: 'timestamp_arrival', order: 'desc'},
      ]);

    const upgrade = await query;

    const upgradePkt: StatePkt = {
      timestamp,
      type: 'upgrade',
      events: upgrade,
    };

    return upgradePkt;
  }
}

export default PGDatabase;
