import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as VisualizationPeeringTopologyInterface,
  returnType,
} from '../../../query-interface/Visualization/VisualizationPeeringTopology';

type queryReturnType = {
  local_bmp_router: string;
  local_rd: string;
  local_ip: string;
  peer_bmp_router: string;
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
        WHERE is_out = true
      ), peer_up AS (
        SELECT DISTINCT bmp_router, peer_ip, rd, local_ip, local_port, remote_port
        FROM event
        WHERE bmp_msg_type = 'peer_up'
        AND timestamp_arrival > 1619438810
      ), locally AS (
        SELECT p.bmp_router AS local_bmp_router, p.local_ip, p.rd AS local_rd, p.local_port, p.peer_ip, p.remote_port
        FROM peer_up AS p
        INNER JOIN router_list AS rl
        ON p.bmp_router = rl.bmp_router
        AND p.rd is not distinct from rl.rd
        AND p.peer_ip = rl.peer_ip
      )
      SELECT DISTINCT l.local_bmp_router, l.local_ip, l.local_rd, p.bmp_router AS peer_bmp_router, l.peer_ip, p.rd AS peer_rd
      FROM locally AS l
      INNER JOIN peer_up AS p
      ON l.local_port = p.remote_port
      AND l.remote_port = p.local_port
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
