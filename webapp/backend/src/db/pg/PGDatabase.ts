import Database from '../Database';
import {
  sql,
  DatabasePoolType,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from 'slonik';
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
    console.log(distinctVpn);

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

    console.log(query);
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
    let currentTimestamp = Math.floor(startTimestamp / precision) * precision;
    while (currentTimestamp < endTimestamp) {
      const start = currentTimestamp;
      const end = currentTimestamp + precision;
      const estimateQuery = `SELECT *
        FROM ${this.eventTableName}
        WHERE timestamp_arrival > ${start}
        AND timestamp_arrival <= ${end}
        ${filterQuery}`;

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
}

export default PGDatabase;
