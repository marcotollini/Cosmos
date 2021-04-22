// WITH router_list AS (
//   SELECT distinct bmp_router, peer_ip, rd
//   from event
//   where bmp_msg_type = 'route_monitor' and RD is not NULL and is_out = true
//   ), peer_up AS (
//   SELECT distinct bmp_router, peer_ip, rd, local_ip, bgp_id
//   from event
//   where bmp_msg_type = 'peer_up' and RD is not NULL
//   ), locally AS (
//   SELECT DISTINCT p.bmp_router as local_router, p.local_ip, p.rd as local_rd, p.peer_ip
//   FROM peer_up as p
//   INNER JOIN router_list as s
//   ON p.bmp_router = s.bmp_router and p.rd = s.rd and p.peer_ip = s.peer_ip
//   )
//   SELECT l.local_router, l.local_ip, l.local_rd, p.bmp_router as peer_router, p.rd as peer_rd, l.peer_ip
//   FROM locally as l
//   inner join peer_up as p
//   ON l.local_router = p.bgp_id and l.local_ip = p.peer_ip and l.peer_ip = p.local_ip

// Improvement: bmp_router in list of bmp_router of state
