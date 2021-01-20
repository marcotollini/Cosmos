-- 1. list routers

SELECT DISTINCT "bmp_router"
FROM "event_route_monitor"
LIMIT 50

-- 2. for each router, get min time
SELECT min(timestamp_arrival)
FROM "event_route_monitor"
WHERE "bmp_router" = '192.0.2.71'
LIMIT 50

-- min
-- 1610378178

-- 3. get data of the last 10 minutes
SELECT *
FROM "event_route_monitor"
WHERE "bmp_router" = '192.0.2.71' AND timestamp_arrival <= 1610378178 + 10*60
ORDER BY "timestamp" ASC
LIMIT 50

-- 4.



--
select distinct c.bmp_router, c.peer_ip, c.local_ip
FROM "event_peer_up" as "c"
where timestamp_database < '2021-01-11 15:30:50.590963+00' and is_loc is null and (c.bmp_router, c.peer_ip, c.local_ip) not in (
SELECT distinct a.bmp_router, a.peer_ip, a.local_ip
FROM "event_peer_up" as "a"
JOIN "event_peer_up" as "b"
ON a.peer_ip = b.peer_ip and a.local_ip = b.local_ip and a.is_in = b.is_out and a.bmp_router = b.bmp_router
where a.timestamp_database < '2021-01-11 15:30:50.590963+00' and b.timestamp_database < '2021-01-11 15:30:50.590963+00'
)



-- initialization, find min time and add 10 minutes
SELECT min(timestamp_arrival)
FROM "event_peer_up"

-- 1610378165
-- 2.
SELECT bmp_router, bgp_id, local_ip, local_port, peer_ip, remote_port, peer_type, rd, jsonb_agg("event_peer_up"."idEventPeerUp") as list_id, now() as timestamp_snapshot
FROM "event_peer_up"
WHERE is_loc IS NULL
GROUP BY bmp_router, bgp_id, local_ip, local_port, peer_ip, remote_port, peer_type, rd


