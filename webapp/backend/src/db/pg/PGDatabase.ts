import Database from '../Database';
import {
  sql,
  DatabasePoolType,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from 'slonik';
import {at, constant, uniqBy} from 'lodash';

import {
  BMPDump,
  BMPEvent,
  VirtualRouter,
  VirtualRouterDump,
  StatePkt,
  EventCount,
} from 'cosmos-lib/src/types';

class PGDatabase extends Database {
  pool: DatabasePoolType;
  eventTableName = 'event';
  dumpTableName = 'dump';

  constructor(pool: DatabasePoolType) {
    super();
    this.pool = pool;
    // this.timeBetweenDumps = 45 * 60;
  }

  // List of keys to distinguish an event:
  // if the values in two rows it the same, then we can keep the most recent one to
  // produce a correct state
  keyDistinctEvent = [
    'bmp_router',
    'rd',
    'peer_ip',
    'ip_prefix',
    'is_loc',
    'is_in',
    'is_out',
    'is_post',
  ];

  colNamesTypeArray = ['as_path', 'comms', 'ecomms', 'lcomms'];

  /**
   * Returns a query that filters the value accordingly to the given filter. It can be used in a WHERE query.
   * A key of filter might be a single value, or multiple (an array). If it is an array, all the values will be joined with an OR
   * @param {object} filter - The filter used to filter out the events
   * @return {TaggedTemplateLiteralInvocationType<QueryResultRowType>} A query as (a = 1 OR a = 2) AND (b = 10 OR b = 11)
   */
  generateSqlFilter(filter: {
    [key: string]: any | any[];
  }): TaggedTemplateLiteralInvocationType<QueryResultRowType> {
    const andQueries = [];
    for (const [colName, maybeValues] of Object.entries(filter)) {
      const orQueries = [];
      const values = Array.isArray(maybeValues) ? maybeValues : [maybeValues];

      for (const value of values) {
        if (this.colNamesTypeArray.indexOf(colName) !== -1) {
          orQueries.push(
            sql`${sql.json(value)} @> ${sql.identifier([colName])}`
          );
        } else {
          orQueries.push(sql`${sql.identifier([colName])} = ${value}`);
        }
      }

      andQueries.push(sql`(${sql.join(orQueries, sql` OR `)})`);
    }
    return sql`${sql.join(andQueries, sql` AND `)}`;
  }

  /**
   * Returns a list of VPN active in the given status
   * @param {number} timestamp - The timestamp for which we want to find the VPNs
   * @return {Promise<string[]>} The list of distinct VPN in a promise
   */
  async getDistinctVpn(timestamp: number): Promise<string[]> {
    const query = sql`SELECT community
      FROM (SELECT distinct(JSONB_ARRAY_ELEMENTS_TEXT("comms")) as community
        FROM ${sql.identifier([this.dumpTableName])}
        WHERE timestamp <= ${timestamp}
        AND timestamp > ${timestamp - this.timeBetweenDumps}
      ) AS t
      WHERE community LIKE ${'64497:%'}`;

    const request = this.pool.connect(async connection =>
      connection.query(query)
    );

    const result = await request;
    const rows = result.rows as readonly {community: string}[];
    const distinctVpn = rows.map(x => x.community);

    return distinctVpn;
  }

  /**
   * Returns the count of events in buckets of dimension "precision" and limited by startTimestamp and endTimestmap
   * @param {number} startTimestamp - The minimum timestamp for a backet
   * @param {number} endTimestamp - The maximum timestamp for a bucket
   * @param {number} precision - The dimension of each bucket
   * @param {object} filter - The filter used to filter out the events
   * @return {Promise<EventCount[]>} The list of buckets, with the start and end timestamp, and the number of events
   */
  async getEventsCount(
    startTimestamp: number,
    endTimestamp: number,
    precision: number,
    filter?: {[key: string]: any | any[]}
  ): Promise<EventCount[]> {
    const minTimestamp = Math.floor(startTimestamp / precision) * precision;
    const maxTimestamp =
      Math.floor(endTimestamp / precision) * precision + precision;
    const filterQuery = filter
      ? sql`AND ${this.generateSqlFilter(filter)}`
      : sql``;
    const query = sql`
      SELECT
        count,
        (bucket*${precision}) as start_bucket,
        (bucket * ${precision} + ${precision}) as end_bucket
      FROM (
        SELECT
          count(*) as count,
          (timestamp_arrival / ${precision})::integer as bucket
        FROM ${sql.identifier([this.eventTableName])}
        WHERE timestamp_arrival >= ${minTimestamp}
        AND timestamp_arrival <= ${maxTimestamp}
        ${filterQuery}
        GROUP BY bucket
      ) as t
      ORDER BY start_bucket`;

    const request = this.pool.connect(async connection =>
      connection.query(query)
    );

    const result = await request;
    const buckets = (result.rows as unknown) as EventCount[];
    return buckets;
  }

  /**
   * Returns the APPROXIMATED count of events in backets of dimension "precision" and limited by startTimestamp and endTimestmap
   * @param {number} startTimestamp - The minimum timestamp for a backet
   * @param {number} endTimestamp - The maximum timestamp for a bucket
   * @param {number} precision - The dimension of each bucket
   * @return {Promise<EventCount[]>} The list of buckets, with the start and end timestamp, and the approximated number of events
   *  https://wiki.postgresql.org/wiki/Count_estimate
   */
  async getEventsCountApprox(
    startTimestamp: number,
    endTimestamp: number,
    precision: number,
    filter?: {[key: string]: any | any[]}
  ): Promise<EventCount[]> {
    const subqueries = [] as TaggedTemplateLiteralInvocationType<QueryResultRowType>[];
    const filterQuery = filter
      ? sql`AND ${this.generateSqlFilter(filter)}`
      : sql``;
    const filterQueryStr = filterQuery.values.reduce(
      (prev: string, curr: any, index: number) => {
        return prev.replace('$' + index, `'${curr}'`);
      },
      ''
    );
    console.log(filterQuery, filterQueryStr);
    let currentTimestamp = Math.floor(startTimestamp / precision) * precision;
    while (currentTimestamp < endTimestamp) {
      const start = currentTimestamp;
      const end = currentTimestamp + precision;
      const estimateQuery = `SELECT *
        FROM ${this.eventTableName}
        WHERE timestamp_arrival > ${start}
        AND timestamp_arrival <= ${end}
        ${filterQueryStr}`;

      const approxQuery = sql`SELECT
        count_estimate(${estimateQuery})::integer as count,
        ${start}::integer as start_bucket,
        ${end}::integer as end_bucket
      `;
      subqueries.push(approxQuery);
      currentTimestamp += precision;
    }

    const query = sql`SELECT *
      FROM (${sql.join(subqueries, sql` UNION `)}) as t
      ORDER BY start_bucket`;

    const request = this.pool.connect(async connection =>
      connection.query(query)
    );

    const result = await request;
    const buckets = (result.rows as unknown) as EventCount[];
    return buckets;
  }

  async getBMPState(vpn: string, timestamp: number): Promise<StatePkt> {
    const startloading = new Date().getTime();

    const tempTable = 'distdump';
    const tempTableSql = sql`
      CREATE TEMPORARY TABLE ${sql.identifier([tempTable])} ON COMMIT DROP AS
      SELECT DISTINCT ON (bmp_router, rd) bmp_router, rd, seq, timestamp
      FROM ${sql.identifier([this.dumpTableName])}
      WHERE bmp_msg_type = ${'route_monitor'}
      AND comms @> ${sql.json(vpn)}
      AND timestamp > ${timestamp - this.timeBetweenDumps}
      AND timestamp <= ${timestamp}
      ORDER BY bmp_router, rd, timestamp DESC
    `;

    const dumpSql = sql`
      SELECT dp.*
      FROM ${sql.identifier([this.dumpTableName])} AS dp
      RIGHT JOIN ${sql.identifier([tempTable])} AS tmpdp
      ON dp.bmp_router = tmpdp.bmp_router
      AND dp.rd is not distinct from tmpdp.rd
      AND dp.seq = tmpdp.seq
      WHERE dp.bmp_msg_type = ${'route_monitor'}
      AND dp.comms @> ${sql.json(vpn)}
      AND dp.timestamp >= ${timestamp - this.timeBetweenDumps}
      AND dp.timestamp < ${timestamp}
      ORDER BY dp.timestamp DESC
    `;

    const keyDistinctEventSql = sql.join(
      this.keyDistinctEvent.map(x => sql.identifier(['et', x])),
      sql`, `
    );
    const upgradeSql = sql`
      SELECT DISTINCT ON (${keyDistinctEventSql}) et.*
      FROM ${sql.identifier([this.eventTableName])} AS et
      LEFT JOIN ${sql.identifier([tempTable])} as tmpdp
      ON et.bmp_router = tmpdp.bmp_router
      AND et.rd is not distinct from tmpdp.rd
      WHERE et.bmp_msg_type = ${'route_monitor'}
      AND et.comms @> ${sql.json(vpn)}
      AND et.timestamp_arrival > ${timestamp - this.timeBetweenDumps}
      AND et.timestamp_arrival <= ${timestamp}
      ORDER BY ${keyDistinctEventSql}, et.timestamp_arrival DESC
    `;

    const [dumpQuery, upgradeQuery] = await this.pool.connect(
      async connection =>
        connection.transaction(async transactionConnection => {
          await transactionConnection.query(tempTableSql);
          const requestDump = transactionConnection.query(dumpSql);
          const requestUpgrade = transactionConnection.query(upgradeSql);

          const [dumpQuery, upgradeQuery] = await Promise.all([
            requestDump,
            requestUpgrade,
          ]);

          return [dumpQuery, upgradeQuery];
        })
    );

    const startelaborating = new Date().getTime();
    const dumpRows = (dumpQuery.rows as unknown) as BMPDump[];
    const upgradeRows = (upgradeQuery.rows as unknown) as BMPEvent[];

    const eventsDistict: (BMPDump | BMPEvent)[] = uniqBy(
      [...upgradeRows, ...dumpRows],
      e => {
        return at(e as any, this.keyDistinctEvent).join('-');
      }
    );

    const statePkt: StatePkt = {
      timestamp,
      type: 'state',
      events: eventsDistict,
    };
    const end = new Date().getTime();
    console.log('loading graph took', (end - startloading) / 1000);

    return statePkt;
  }

  async getBMPUpgrade(
    vpn: string,
    timestamp: number,
    startTimestamp: number
  ): Promise<StatePkt> {
    const keyDistinctEventSql = sql.join(
      this.keyDistinctEvent.map(x => sql.identifier(['et', x])),
      sql`, `
    );

    const query = sql`
      SELECT DISTINCT ON (${keyDistinctEventSql}) et.*
      FROM ${sql.identifier([this.eventTableName])} AS et
      WHERE et.bmp_msg_type = ${'route_monitor'}
      AND et.comms @> ${sql.json(vpn)}
      AND et.timestamp_arrival > ${startTimestamp}
      AND et.timestamp_arrival <= ${timestamp}
      ORDER BY ${keyDistinctEventSql}, et.timestamp_arrival DESC
    `;

    const request = this.pool.connect(async connection =>
      connection.query(query)
    );

    const result = await request;
    const upgrade = (result.rows as unknown) as BMPEvent[];

    const upgradePkt: StatePkt = {
      timestamp,
      type: 'upgrade',
      events: upgrade,
    };

    return upgradePkt;
  }
}

export default PGDatabase;
