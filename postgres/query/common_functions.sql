-- Used to get the max timestamp while creating a snapshot
-- can be used to create older snapshot in case the data in the last minutes is very variable (NOW() - INTERVAL '10 minutes')
-- DROP FUNCTION IF EXISTS new_snapshot_timestamp();
CREATE OR REPLACE FUNCTION new_snapshot_timestamp()
RETURNS integer AS $$ SELECT extract(epoch FROM NOW())::integer $$ LANGUAGE sql;

-- List of events
-- DROP FUNCTION IF EXISTS event_list_snapshot();
CREATE OR REPLACE FUNCTION event_list_snapshot()
RETURNS jsonb AS $$ SELECT '["event_init", "event_log_init", "event_peer_down", "event_peer_up", "event_route_monitor", "event_stats", "event_log_close", "event_term"]'::jsonb $$ LANGUAGE sql;

-- event table name to id mapping
-- DROP FUNCTION IF EXISTS name_original_id(_original_table_name text);
CREATE OR REPLACE FUNCTION name_original_id(_original_table_name text)
RETURNS text
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    IF _original_table_name = 'event_init' THEN RETURN 'id_init';
    ELSIF _original_table_name = 'event_log_init' THEN RETURN 'id_log_init';
    ELSIF _original_table_name = 'event_peer_down' THEN RETURN 'id_peer_down';
    ELSIF _original_table_name = 'event_peer_up' THEN RETURN 'id_peer_up';
    ELSIF _original_table_name = 'event_route_monitor' THEN RETURN 'id_route_monitor';
    ELSIF _original_table_name = 'event_stats' THEN RETURN 'id_stats';
    ELSIF _original_table_name = 'event_log_close' THEN RETURN 'id_log_close';
    ELSIF _original_table_name = 'event_term' THEN RETURN 'id_term';
    END IF;
END;
$$;

-- Strategy to distinguish two rows
-- For example, if we define 'bmp_router, peer_ip' for an event, on snapshot creation
-- all the rows with a common pair 'bmp_router, peer_ip' will be discarded but the one with
-- max timestamp_arrival DESC (you can modify this parameter by using fn name_columns_distinct_timestamp)
-- DROP FUNCTION IF EXISTS name_columns_distinct(_original_table_name text);
CREATE OR REPLACE FUNCTION name_columns_distinct(_original_table_name text)
RETURNS text
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    IF _original_table_name = 'event_init' THEN RETURN 'bmp_router';
    ELSIF _original_table_name = 'event_log_init' THEN RETURN 'bmp_router';
    ELSIF _original_table_name = 'event_peer_down' THEN RETURN 'bmp_router, peer_ip, peer_asn, peer_type, rd';
    ELSIF _original_table_name = 'event_peer_up' THEN RETURN 'bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip';
    ELSIF _original_table_name = 'event_route_monitor' THEN RETURN 'afi, safi, ip_prefix, rd, bgp_nexthop, peer_ip, bmp_router, is_in, is_filtered, is_loc, is_post, is_out';
    ELSIF _original_table_name = 'event_stats' THEN RETURN 'bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, counter_type, afi, safi';
    ELSIF _original_table_name = 'event_log_close' THEN RETURN 'bmp_router';
    ELSIF _original_table_name = 'event_term' THEN RETURN 'bmp_router';
    END IF;
END;
$$;

-- On snapshot, only the first row with a common set of values (see name_columns_distinct) is retained
-- Here you can define the sorting strategy. The first row after sorting will be saved in the snapshot
-- while the others will be discarded
-- DROP FUNCTION IF EXISTS name_columns_distinct_timestamp(_original_table_name text);
CREATE OR REPLACE FUNCTION name_columns_distinct_timestamp(_original_table_name text)
RETURNS text
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    IF _original_table_name = 'event_init' THEN RETURN 'timestamp_arrival DESC';
    ELSIF _original_table_name = 'event_log_init' THEN RETURN 'timestamp DESC';
    ELSIF _original_table_name = 'event_peer_down' THEN RETURN 'timestamp_arrival DESC';
    ELSIF _original_table_name = 'event_peer_up' THEN RETURN 'timestamp_arrival DESC';
    ELSIF _original_table_name = 'event_route_monitor' THEN RETURN 'timestamp_arrival DESC';
    ELSIF _original_table_name = 'event_stats' THEN RETURN 'timestamp_arrival DESC';
    ELSIF _original_table_name = 'event_log_close' THEN RETURN 'timestamp DESC';
    ELSIF _original_table_name = 'event_term' THEN RETURN 'timestamp_arrival DESC';
    END IF;
END;
$$;

-- The list of rows that should be retained in the snapshot. If the main table has NOT NULL, those columns
-- need to be included here.
-- DROP FUNCTION IF EXISTS name_columns_common_between_original_distinct(_original_table_name text);
CREATE OR REPLACE FUNCTION name_columns_common_between_original_distinct(_original_table_name text)
RETURNS text
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    IF _original_table_name = 'event_init' THEN RETURN 'id_init, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, bmp_init_info_string, bmp_init_info_sysdescr, bmp_init_info_sysname, timestamp_database';
    ELSIF _original_table_name = 'event_log_init' THEN RETURN 'id_log_init, seq, "timestamp", event_type, writer_id, bmp_router, bmp_router_port, timestamp_database';
    ELSIF _original_table_name = 'event_peer_down' THEN RETURN 'id_peer_down, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, rd, reason_type, reason_str, reason_loc_code, timestamp_database';
    ELSIF _original_table_name = 'event_peer_up' THEN RETURN 'id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database';
    ELSIF _original_table_name = 'event_route_monitor' THEN RETURN 'id_route_monitor, log_type, seq, "timestamp", event_type, writer_id, afi, safi, ip_prefix, rd, bgp_nexthop, as_path, as_path_id, comms, ecomms, lcomms, origin, local_pref, med, aigp, psid_li, label, peer_ip, peer_tcp_port, timestamp_arrival, bmp_router, bmp_router_port, bmp_msg_type, is_in, is_filtered, is_loc, is_post, is_out, timestamp_database';
    ELSIF _original_table_name = 'event_stats' THEN RETURN 'id_stats, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, counter_type, counter_type_str, counter_value, afi, safi, timestamp_database';
    ELSIF _original_table_name = 'event_log_close' THEN RETURN 'id_log_close, seq, "timestamp", event_type, writer_id, bmp_router, bmp_router_port, timestamp_database';
    ELSIF _original_table_name = 'event_term' THEN RETURN 'id_term, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, bmp_init_info_string, bmp_term_info_reason, timestamp_database';
    END IF;
END;
$$;


-- DROP FUNCTION IF EXISTS timescale_snapshot_setup(_original_table_name text);
DROP TYPE IF EXISTS timescale_snapshot_setup_typ;
CREATE TYPE timescale_snapshot_setup_typ AS (column_name text, chunk_time_interval bigint, column_name_info text, chunk_time_interval_info bigint);
CREATE OR REPLACE FUNCTION timescale_snapshot_setup(_original_table_name text)
RETURNS timescale_snapshot_setup_typ
LANGUAGE plpgsql
AS
$$
DECLARE
    s timescale_snapshot_setup_typ;
BEGIN
    IF _original_table_name = 'event_init' THEN SELECT 'timestamp_arrival', 7*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_log_init' THEN SELECT 'timestamp', 7*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_peer_down' THEN SELECT 'timestamp_arrival', 7*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_peer_up' THEN SELECT 'timestamp_arrival', 7*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_route_monitor' THEN SELECT 'timestamp_arrival', 3*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_stats' THEN SELECT 'timestamp_arrival', 1*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_log_close' THEN SELECT 'timestamp', 7*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    ELSIF _original_table_name = 'event_term' THEN SELECT 'timestamp_arrival', 7*24*60*60 INTO s.column_name, s.chunk_time_interval; SELECT 'timestamp_start', 7*24*60*60*1000000::bigint INTO s.column_name_info, s.chunk_time_interval_info; RETURN s;
    END IF;
END;
$$;
