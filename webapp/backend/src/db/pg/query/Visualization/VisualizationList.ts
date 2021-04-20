import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as VisualizationListInterface,
  returnType,
} from '../../../query-interface/Visualization/VisualizationList';

type queryReturnType = {
  bmp_router: string;
  rd: string;
  ip_prefix: string;
  bmp_nexthop: string;
  comms: string[];
}[];

class VisualizationList extends Query implements VisualizationListInterface {
  bmpstate: slonikSql;
  constructor(bmpstate: slonikSql) {
    super();
    this.bmpstate = bmpstate;
  }

  raw() {
    return sql`
      SELECT DISTINCT bmp_router, rd, ip_prefix, bgp_nexthop, comms
      FROM (${this.bmpstate}) as bmpstate
      LIMIT 100
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default VisualizationList;
export {returnType, queryReturnType};
