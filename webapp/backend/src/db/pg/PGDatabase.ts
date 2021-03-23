import Database from '../Database';
import {knex, Knex} from 'knex';
import {at, uniqBy} from 'lodash';

import {
  BMPDump,
  BMPEvent,
  VirtualRouter,
  VirtualRouterDump,
  StatePkt,
  UpgradePkt,
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

  async getDistinctVpn(): Promise<string[]> {
    // too complex for knex
    // ::intger makes the query from minutes to ms
    const query = this.knex.raw(
      `SELECT "community"
      FROM(
        SELECT distinct(JSONB_ARRAY_ELEMENTS_TEXT("comms")) AS "community"
        FROM "${this.dumpTableName}"
        WHERE "timestamp" > extract(EPOCH from now())::integer - ${this.timeBetweenDumps}
      ) AS "t"
      WHERE "community" LIKE '64497:%'`
    );

    const vpns = (await query).rows.map(
      (x: {community: string}) => x.community
    );
    return vpns;
  }

  async getEventsCounter(
    startTimestamp: number,
    endTimestamp: number,
    precision: number
  ): Promise<EventCount[]> {
    const query = this.knex.raw(`
    SELECT
      ("timestamp_arrival" / ${precision})::integer*${precision} as "startgroup",
      ("timestamp_arrival" / ${precision})::integer*${precision} + ${precision} as "endgroup",
      count(*) as count
    FROM ${this.eventTableName}
    WHERE "timestamp_arrival" >= '${startTimestamp}' AND "timestamp_arrival" <= '${endTimestamp}'
    GROUP BY "startgroup"
    `);
    const buckets: EventCount[] = (await query).rows;
    return buckets;
  }

  async getEventsCounterApprox(
    startTimestamp: number,
    endTimestamp: number,
    precision: number
  ): Promise<EventCount[]> {
    let currentTimestamp = Math.floor(startTimestamp / precision) * precision;
    const approxQueries = [];
    while (currentTimestamp <= endTimestamp) {
      const start = currentTimestamp;
      const end = currentTimestamp + precision;
      const approxQuery = `SELECT
        count_estimate('SELECT * from ${this.eventTableName} where "timestamp_arrival" > ${start} and "timestamp_arrival" <= ${end}'),
        ${start} as startgroup,
        ${end} as endgroup`;
      approxQueries.push(this.knex.raw(approxQuery));
      currentTimestamp += precision;
    }
    const query = this.knex.unionAll(approxQueries);
    console.log(query.toString());
    const buckets: EventCount[] = await query;
    return buckets;
  }

  // https://wiki.postgresql.org/wiki/Count_estimate

  // General filter for next to all queries
  private BMPGeneralFilter(
    knex: Knex.QueryBuilder,
    table_name: string,
    vpn: string
  ) {
    return knex
      .where(`${table_name}.bmp_msg_type`, '=', 'route_monitor')
      .whereRaw(`"${table_name}"."comms" @> ?`, [JSON.stringify(vpn)]);
  }

  // Select and filters the dump queries
  private BMPDumpFilter(vpn: string, timestamp: number) {
    const knex = this.knex<BMPDump>(this.knex.ref(this.dumpTableName).as('dp'));
    return this.BMPGeneralFilter(knex, 'dp', vpn)
      .where('dp.timestamp', '>=', timestamp - this.timeBetweenDumps)
      .where('dp.timestamp', '<=', timestamp);
  }

  // Select and filters the events queries
  private BMPEventFilter(
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ) {
    const knex = this.knex<BMPDump>(
      this.knex.ref(this.eventTableName).as('et')
    );
    return this.BMPGeneralFilter(knex, 'et', vpn)
      .where('et.timestamp_arrival', '>=', startTimestamp)
      .where('et.timestamp_arrival', '<=', timestamp);
  }

  // Select the given table name, filters it, and distinct on the
  // properties to cal the virtual routers
  private virtualRoutersBMPGeneral(
    table_name: string,
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ) {
    const knex = this.knex(this.knex.ref(table_name).as('table'))
      .distinctOn('bmp_router', 'rd')
      .orderBy(['bmp_router', 'rd', {column: 'timestamp', order: 'DESC'}]);

    return this.BMPGeneralFilter(knex, 'table', vpn)
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
        state: {},
      };

      for (const event of eventsDistict) {
        const virtualRouter: VirtualRouter = {
          bmp_router: event.bmp_router,
          rd: event.rd,
        };
        const VRKey = virtualRouterToKey(virtualRouter);

        if (!statePkt.state[VRKey]) {
          statePkt.state[VRKey] = {
            virtualRouter,
            events: [],
          };
        }

        statePkt.state[VRKey].events.push(event);
      }

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
  ): Promise<UpgradePkt> {
    const query = this.BMPEventFilter(vpn, timestamp, startTimestamp)
      .select('et.*')
      .distinctOn(...this.keyDistinctEvent)
      .orderBy([
        ...this.keyDistinctEvent,
        {column: 'timestamp_arrival', order: 'desc'},
      ]);

    const upgrade = await query;

    const upgradePkt: UpgradePkt = {
      timestamp,
      upgrade: {},
    };

    for (const event of upgrade) {
      const virtualRouter: VirtualRouter = {
        bmp_router: event.bmp_router,
        rd: event.rd,
      };
      const VRKey = virtualRouterToKey(virtualRouter);

      if (!upgradePkt.upgrade[VRKey]) {
        upgradePkt.upgrade[VRKey] = {
          virtualRouter,
          events: [],
        };
      }

      upgradePkt.upgrade[VRKey].events.push(event);
    }

    return upgradePkt;
  }
}

export default PGDatabase;
