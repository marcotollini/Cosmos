import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as VisualizationVPNTopologyInterface,
  returnType,
} from '../../../query-interface/Visualization/VisualizationVPNTopology';

type queryReturnType = {
  bmp_router: string;
  rd: string;
}[];

class VisualizationVPNTopology
  extends Query
  implements VisualizationVPNTopologyInterface {
  bmpstate: slonikSql;
  constructor(bmpstate: slonikSql) {
    super();
    this.bmpstate = bmpstate;
  }

  raw() {
    return sql`
      SELECT DISTINCT bmp_router, rd
      FROM (${this.bmpstate}) as bmpstate
      WHERE rd IS NOT NULL
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default VisualizationVPNTopology;
export {returnType, queryReturnType};
