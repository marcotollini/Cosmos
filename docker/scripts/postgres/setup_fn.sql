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
   curr_timestamp_analyzed integer = extract(epoch FROM NOW() - INTERVAL '10 minutes');
   cur_id integer;

   result Record;

   prev_snap_info "snapshot_peer_info";
   cur_snap_info "snapshot_peer_info";
begin
   SELECT * INTO prev_snap_info FROM get_last_peer_snapsot();

   -- get latest records from peer up
   CREATE TEMP TABLE "modified_peer_up" AS
   SELECT bmp_router, bmp_router_port, bgp_id, local_ip, local_port, peer_ip, remote_port, peer_type, rd, max("timestamp") as "max_timestamp", min("timestamp_arrival") as "min_timestamp_arrival", max("idEventPeerUp") as "max_id_event_peer_up"
   FROM "event_peer_up"
   WHERE is_loc IS NULL AND "timestamp_arrival" <= curr_timestamp_analyzed AND "idEventPeerUp" >= "prev_snap_info"."max_peer_up_id"
   GROUP BY bmp_router, bmp_router_port, bgp_id, local_ip, local_port, peer_ip, remote_port, peer_type, rd;

   -- get latest records from peer down
   CREATE TEMP TABLE "modified_peer_down" AS
   SELECT *
   FROM "event_peer_down"
   WHERE "timestamp_arrival" <= curr_timestamp_analyzed AND "idEventPeerDown" >= "prev_snap_info"."max_peer_down_id";

    -- save current analyzed
   SELECT COALESCE(max("max_id_event_peer_up"), 0) INTO cur_snap_info.max_peer_up_id FROM modified_peer_up;
   SELECT COALESCE(max("idEventPeerDown"), 0) INTO cur_snap_info.max_peer_down_id FROM modified_peer_down;
   SELECT curr_timestamp_start as "timestamp_start" INTO cur_snap_info.timestamp_start;
   SELECT curr_timestamp_analyzed as "timestamp_analyzed" INTO cur_snap_info.timestamp_analyzed;
   -- inserting current analyzed
   INSERT INTO snapshot_peer_info("timestamp_start", "timestamp_analyzed", "max_peer_up_id", "max_peer_down_id")
   VALUES (cur_snap_info.timestamp_start, cur_snap_info.timestamp_analyzed, cur_snap_info.max_peer_up_id, cur_snap_info.max_peer_down_id)
   RETURNING "idSnapshotPeerInfo"
   INTO cur_snap_info."idSnapshotPeerInfo";


   -- get modified peer up, previous peers up, remove peers down
   WITH
   "prev_up" AS (
      SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", "max_timestamp", "min_timestamp_arrival"
      FROM "snapshot_peer"
      WHERE "idSnapshotPeerInfo" = prev_snap_info."idSnapshotPeerInfo"
   ),
   "up_merged" AS (
      SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", "max_timestamp", "min_timestamp_arrival"
      FROM "modified_peer_up"
      UNION
      SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", "max_timestamp", "min_timestamp_arrival"
      FROM "prev_up"
   ),
   "up_merged_distinct" AS (
      SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", max("max_timestamp") as "max_timestamp", max("min_timestamp_arrival") as "min_timestamp_arrival" -- max of min is correct
      FROM "up_merged" as "up"
      GROUP BY "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd"
   ),
   "up_minus_down" AS (
      SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", "max_timestamp", "min_timestamp_arrival"
      FROM "up_merged" as "up"
      WHERE NOT EXISTS (
         SELECT * FROM modified_peer_down as "down"
         WHERE "up"."bmp_router" = "down"."bmp_router" AND "up"."bmp_router_port" = "down"."bmp_router_port" AND "up"."peer_ip" = "down"."peer_ip" AND "up"."rd" = "down"."rd"
         AND (("up"."max_timestamp" IS NOT NULL AND "down"."timestamp" IS NOT NULL AND "up"."max_timestamp" > "down"."timestamp") OR ("up"."max_timestamp" IS NULL AND "down"."timestamp" IS NULL AND "up"."min_timestamp_arrival" > "down"."timestamp_arrival"))
      )
   )
   INSERT INTO "snapshot_peer"("bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", "max_timestamp", "min_timestamp_arrival", "idSnapshotPeerInfo")
   SELECT "bmp_router", "bmp_router_port", "bgp_id", "local_ip", "local_port", "peer_ip", "remote_port", "peer_type", "rd", "max_timestamp", "min_timestamp_arrival", cur_snap_info."idSnapshotPeerInfo" as "idSnapshotPeerInfo"
   FROM up_minus_down;

   UPDATE snapshot_peer_info
   SET timestamp_end = NOW()
   WHERE snapshot_peer_info."idSnapshotPeerInfo" = cur_snap_info."idSnapshotPeerInfo";

   SELECT max("idSnapshotPeerInfo") INTO result FROM "snapshot_peer_info";

   return result;
end;
$$;
