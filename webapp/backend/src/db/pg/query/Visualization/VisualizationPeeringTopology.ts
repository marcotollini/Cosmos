import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as VisualizationPeeringTopologyInterface,
  returnType,
} from '../../../query-interface/Visualization/VisualizationPeeringTopology';

type queryReturnType = {
  local_router: string;
  local_rd: string;
  local_ip: string;
  peer_router: string;
  peer_rd: string;
  peer_ip: string;
}[];

class VisualizationPeeringTopology
  extends Query
  implements VisualizationPeeringTopologyInterface {
  bmpstate: slonikSql;
  constructor(bmpstate: slonikSql) {
    super();
    this.bmpstate = bmpstate;
  }

  raw() {
    return sql`
      WITH router_list AS (
        SELECT DISTINCT bmp_router, peer_ip, rd
        FROM (${this.bmpstate}) AS state
        WHERE RD IS NOT NULL AND is_out = true
      ), peer_up AS (
        SELECT DISTINCT bmp_router, peer_ip, rd, local_ip, bgp_id
        FROM dump
        WHERE bmp_msg_type = 'peer_up' and RD is not NULL
      ), locally AS (
        SELECT p.bmp_router as local_router, p.local_ip, p.rd as local_rd, p.peer_ip
        FROM peer_up AS p
        INNER JOIN router_list as rl
        ON p.bmp_router = rl.bmp_router and p.rd = rl.rd and p.peer_ip = rl.peer_ip
      )
      SELECT l.local_router, l.local_ip, l.local_rd, p.bmp_router as peer_router, p.rd as peer_rd, l.peer_ip
      FROM locally as l
      INNER JOIN bmp_state as st
      ON l.local_router = p.bgp_id and l.local_ip = p.peer_ip and l.peer_ip = p.local_ip
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default VisualizationPeeringTopology;
export {returnType, queryReturnType};

//   SELECT l.local_router, l.local_ip, l.local_rd, p.bmp_router as peer_router, p.rd as peer_rd, l.peer_ip
//   FROM locally as l
//   inner join peer_up as p
//   ON l.local_router = p.bgp_id and l.local_ip = p.peer_ip and l.peer_ip = p.local_ip

// Improvement: bmp_router in list of bmp_router of state
// Instead of using peer up the second time, we should use the state again, as a state might not use all rd available, which we would include
// by using peer up (remember, peer up does not have vpn info)
