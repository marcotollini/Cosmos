import {sql} from 'slonik';

import {default as Query, slonikSql} from '../Query';
import {
  default as VPNListInterface,
  returnType,
} from '../../query-interface/VPNList';

type queryReturnType = {community: string}[];

class VPNList extends Query implements VPNListInterface {
  timestamp: Date;
  constructor(timestamp: Date) {
    super();
    this.timestamp = timestamp;
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

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;

    const distinctVpn = rows.map(x => x.community);
    return distinctVpn;
  }
}

export default VPNList;
export {returnType, queryReturnType};
