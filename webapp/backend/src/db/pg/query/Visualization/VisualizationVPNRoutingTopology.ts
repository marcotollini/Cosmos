import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as VisualizationVPNRoutingTopologyInterface,
  returnType,
} from '../../../query-interface/Visualization/VisualizationVPNRoutingTopology';

type queryReturnType = {
  src_bmp_router: string;
  src_rd: string;
  dst_bmp_router: string;
  dst_rd: string;
}[];

class VisualizationVPNRoutingTopology
  extends Query
  implements VisualizationVPNRoutingTopologyInterface {
  bmpstate: slonikSql;
  constructor(bmpstate: slonikSql) {
    super();
    this.bmpstate = bmpstate;
  }

  raw() {
    // TODO in bmp_router_nh_self we should use is_loc. This is a fix while is_loc is NULL
    return sql`
      WITH state as (
        ${this.bmpstate}
      ),
      bmp_router_nh_self AS(
        SELECT DISTINCT bmp_router, rd, bgp_nexthop
        FROM state
        WHERE rd IS NOT NULL
        AND bmp_router = bgp_nexthop
        AND is_out = true
      )
      SELECT DISTINCT l.bmp_router AS dst_bmp_router, l.rd AS dst_rd, s.bmp_router AS src_bmp_router, s.rd AS src_rd
      FROM bmp_router_nh_self as l
      JOIN state AS s
      ON l.bmp_router != s.bmp_router
      AND l.bgp_nexthop != s.bgp_nexthop
      WHERE s.rd IS NOT NULL
      AND s.is_loc = true
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default VisualizationVPNRoutingTopology;
export {returnType, queryReturnType};
