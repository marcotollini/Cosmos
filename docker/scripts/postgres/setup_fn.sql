CREATE OR REPLACE function get_last_peer_snapsot()
returns "snapshot_peer_info"
language plpgsql
as
$$
declare
   result "snapshot_peer_info";
begin
   select *
   into result
   from "snapshot_peer_info"
   where "idSnapshotPeerInfo" = (SELECT max("idSnapshotPeerInfo") from "snapshot_peer_info");

   IF result."timestamp_analyzed" IS NULL THEN
      SELECT 0, 0, 0
      INTO result."timestamp_analyzed", result."max_peer_up_id", result."max_peer_down_id";
   END IF;

    return result;
end;
$$;

DROP FUNCTION compute_peer_snapsot();
-- https://stackoverflow.com/questions/21786535/calling-a-function-inside-another-function-in-pl-pgsql
CREATE OR REPLACE function compute_peer_snapsot()
returns RECORD
language plpgsql
as
$$
declare
   curr_timestamp_start timestamptz = NOW();
   curr_timestamp_end timestamptz = NULL;
   curr_timestamp_analyzed timestamptz = NOW() - INTERVAL '10 minutes';

   prev_snap_info "snapshot_peer_info";
begin
   SELECT * INTO prev_snap_info FROM get_last_peer_snapsot();

   WITH
   "modified_peer_up" AS (
      SELECT bmp_router, bmp_router_port, bgp_id, local_ip, local_port, peer_ip, remote_port, peer_type, rd, max("timestamp") as "timestamp", max("timestamp_arrival") as "timestamp_arrival"
      FROM "event_peer_up"
      WHERE is_loc IS NULL AND "timestamp_arrival" <= extract(epoch FROM curr_timestamp_analyzed) AND "idEventPeerUp" >= "prev_snap_info"."max_peer_up_id"
      GROUP BY bmp_router, bmp_router_port, bgp_id, local_ip, local_port, peer_ip, remote_port, peer_type, rd
   ),
   "modified_peer_down" AS (
      SELECT *
      FROM "event_peer_down"
      WHERE "timestamp_arrival" <= extract(epoch FROM curr_timestamp_analyzed) AND "idEventPeerDown" >= "prev_snap_info"."max_peer_down_id"
   ),
   "modified_up_minus_down" AS (
      SELECT *
      FROM "modified_peer_up" as "up"
      WHERE NOT EXISTS (
         SELECT * FROM modified_peer_down as "down"
         WHERE "up"."bmp_router" = "down"."bmp_router" AND "up"."bmp_router_port" = "down"."bmp_router_port" AND "up"."peer_ip" = "down"."peer_ip" AND "up"."rd" = "down"."rd"
         AND (("up"."timestamp" IS NOT NULL AND "down"."timestamp" IS NOT NULL AND "up"."timestamp" > "down"."timestamp") OR ("up"."timestamp" IS NULL AND "down"."timestamp" IS NULL AND "up"."timestamp_arrival" > "down"."timestamp_arrival"))
      )
   )

   INSERT INTO "snapshot_peer"("bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd")
   SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd"
   FROM modified_up_minus_down;

   return NULL;
end;
$$;
