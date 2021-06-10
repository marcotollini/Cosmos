BEGIN;
WITH dumpinteresting AS (
    SELECT *
    FROM dump
    WHERE bmp_msg_type = 'route_monitor'
    AND comms @> '"64497:1"'
    AND timestamp > 1623057900
    AND timestamp <= 1623086281
), rdlist AS (
    SELECT DISTINCT ON (bmp_router, rd) bmp_router, rd, seq, timestamp
    FROM dumpinteresting
    ORDER BY bmp_router, rd, timestamp DESC
), dumpstate AS (
    SELECT dp.seq,dp.timestamp,dp.timestamp_arrival,dp.timestamp_database,dp.event_type,dp.bmp_msg_type,dp.bmp_router,dp.bmp_router_port,dp.writer_id,dp.local_ip,dp.local_port,dp.peer_ip,dp.remote_port,dp.peer_asn,dp.peer_type,dp.peer_type_str,dp.is_in,dp.is_filtered,dp.is_loc,dp.is_post,dp.is_out,dp.rd,dp.bgp_id,dp.log_type,dp.afi,dp.safi,dp.ip_prefix,dp.bgp_nexthop,dp.as_path,dp.as_path_id,dp.comms,dp.ecomms,dp.lcomms,dp.origin,dp.local_pref,dp.med,dp.aigp,dp.psid_li,dp.label,peer_tcp_port, dp.timestamp AS timestamp_comparable
    FROM dumpinteresting AS dp
    RIGHT JOIN rdlist AS tmpdp
    ON dp.bmp_router = tmpdp.bmp_router
    AND dp.rd is not distinct from tmpdp.rd
    AND dp.seq = tmpdp.seq
    ORDER BY dp.timestamp DESC
), eventstate AS (
    SELECT DISTINCT ON (et.bmp_router,et.rd,et.peer_ip,et.ip_prefix,et.bgp_nexthop,et.is_loc,et.is_in,et.is_out,et.is_post)
et.seq,et.timestamp,et.timestamp_arrival,et.timestamp_database,et.event_type,et.bmp_msg_type,et.bmp_router,et.bmp_router_port,et.writer_id,et.local_ip,et.local_port,et.peer_ip,et.remote_port,et.peer_asn,et.peer_type,et.peer_type_str,et.is_in,et.is_filtered,et.is_loc,et.is_post,et.is_out,et.rd,et.bgp_id,et.log_type,et.afi,et.safi,et.ip_prefix,et.bgp_nexthop,et.as_path,et.as_path_id,et.comms,et.ecomms,et.lcomms,et.origin,et.local_pref,et.med,et.aigp,et.psid_li,et.label,et.peer_tcp_port, et.timestamp_arrival AS timestamp_comparable
    FROM event AS et
    LEFT JOIN rdlist as tmpdp
    ON et.bmp_router = tmpdp.bmp_router
    AND et.rd is not distinct from tmpdp.rd
    WHERE et.bmp_msg_type = 'route_monitor'
    AND et.comms @> '"64497:1"'
    AND et.timestamp_arrival > 1623057900
    AND et.timestamp_arrival <= 1623086281
    ORDER BY et.bmp_router,et.rd,et.peer_ip,et.ip_prefix,et.bgp_nexthop,et.is_loc,et.is_in,et.is_out,et.is_post, et.timestamp_arrival DESC
), unionstate AS (
    SELECT *
    FROM eventstate
    UNION
    SELECT *
    FROM dumpstate
)
SELECT DISTINCT ON (bmp_router,rd,peer_ip,ip_prefix,bgp_nexthop,is_loc,is_in,is_out,is_post) unionstate.seq,unionstate.timestamp,unionstate.timestamp_arrival,unionstate.timestamp_database,unionstate.event_type,unionstate.bmp_msg_type,unionstate.bmp_router,unionstate.bmp_router_port,unionstate.writer_id,unionstate.local_ip,unionstate.local_port,unionstate.peer_ip,unionstate.remote_port,unionstate.peer_asn,unionstate.peer_type,unionstate.peer_type_str,unionstate.is_in,unionstate.is_filtered,unionstate.is_loc,unionstate.is_post,unionstate.is_out,unionstate.rd,unionstate.bgp_id,unionstate.log_type,unionstate.afi,unionstate.safi,unionstate.ip_prefix,unionstate.bgp_nexthop,unionstate.as_path,unionstate.as_path_id,unionstate.comms,unionstate.ecomms,unionstate.lcomms,unionstate.origin,unionstate.local_pref,unionstate.med,unionstate.aigp,unionstate.psid_li,unionstate.label,unionstate.peer_tcp_port
FROM unionstate
WHERE log_type != 'withdraw' OR log_type is NULL
ORDER BY bmp_router,rd,peer_ip,ip_prefix,bgp_nexthop,is_loc,is_in,is_out,is_post, timestamp_comparable DESC;
END;