import {sql} from 'slonik';

import {default as Query, slonikSql} from '../Query';
import {
  default as CountEventsInterface,
  returnType,
} from '../../query-interface/CountEvents';

import FilterBMPState from './Filter/FilterBMPState';

type queryReturnType = {
  start_bucket: number;
  count: number;
}[];

class CountEvents extends Query implements CountEventsInterface {
  timestamp: Date;
  vpn: string;
  filters: Record<string, (string | number | boolean | null)[]>;
  approximation: boolean;
  constructor(
    timestamp: Date,
    vpn: string,
    filters: Record<string, (string | number | boolean | null)[]>,
    approximation: boolean
  ) {
    super();
    this.timestamp = timestamp;
    this.vpn = vpn;
    this.filters = filters;
    this.approximation = approximation;
  }

  raw() {
    const requestedTimestamp = Math.round(this.timestamp.getTime() / 1000);
    const minTimestamp = requestedTimestamp - 60 * 60 * 6;
    const maxTimestamp = Math.min(
      requestedTimestamp + 60 * 60 * 6,
      new Date().getTime()
    );
    const precision = 60;

    const basic = sql`
      SELECT *
      FROM event
      WHERE comms @> ${sql.json(this.vpn)}
      AND timestamp_arrival > ${minTimestamp}
      AND timestamp_arrival <= ${maxTimestamp}
    `;

    const filterClass = new FilterBMPState(basic, this.filters);

    const filtered = filterClass.raw();

    return sql`
      SELECT time_bucket_gapfill(${precision}, timestamp_arrival, ${minTimestamp}, ${maxTimestamp}) AS start_bucket, count(*)
      FROM (${filtered}) as t
      GROUP BY start_bucket
      ORDER BY start_bucket
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default CountEvents;
export {returnType, queryReturnType};
