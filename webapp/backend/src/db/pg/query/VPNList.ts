import {sql, StatementCancelledError} from 'slonik';

import Query from '../Query';

class VPNList extends Query {
  timestamp: Date;
  pid: null | number;
  constructor(timestamp: Date) {
    super();
    this.timestamp = timestamp;
    this.pid = null;
  }

  raw() {
    const timestampUnix = Math.round(this.timestamp.getTime() / 1000);
    return sql`
      SELECT community
      FROM (SELECT DISTINCT(JSONB_ARRAY_ELEMENTS_TEXT("comms")) as community
        FROM dump
        WHERE timestamp <= ${timestampUnix}
        AND timestamp > ${timestampUnix - this.timeBetweenDumps}
      ) AS t
      WHERE community LIKE ${'64497:%'}
    `;
  }
  async execute(): Promise<string[]> {
    const request = this.pool.connect(async connection => {
      this.pid = await this.getPid(connection);
      return connection.query(this.raw());
    });

    try {
      const result = await request;
      const rows = result.rows as readonly {community: string}[];
      const distinctVpn = rows.map(x => x.community);

      this.pid = null;
      return distinctVpn;
    } catch (e) {
      this.pid = null;
      // if (e instanceof StatementCancelledError) {
      //   // query has been cancelled
      //   console.log('Query VPNList cancelled');
      // }
      throw e;
    }
  }

  async cancel() {
    if (this.pid !== null) {
      await this.cancelPid(this.pid);
      return true;
    }
    return false;
  }
}

export default VPNList;
