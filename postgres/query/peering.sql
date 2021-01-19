DROP FUNCTION IF EXISTS get_last_snapshot_info_peering();
CREATE OR REPLACE FUNCTION get_last_snapshot_info_peering()
RETURNS "snapshot_peering_info"
LANGUAGE plpgsql
AS
$$
DECLARE
    latest_info "snapshot_peering_info";
BEGIN
    SELECT *
    INTO latest_info
    FROM snapshot_peering_info
    WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info);

    IF latest_info."timestamp_analyzed" IS NULL THEN
      SELECT 0, 0, 0
      INTO latest_info."timestamp_analyzed", latest_info."max_peer_up_id", latest_info."max_peer_down_id";
    END IF;

    return latest_info;
END;
$$;

DROP FUNCTION IF EXISTS get_max_peer_up_id(max_timestamp integer, min_id_peer_up integer);
CREATE OR REPLACE FUNCTION get_max_peer_up_id(max_timestamp integer, min_id_peer_up integer)
RETURNS integer
LANGUAGE plpgsql
AS
$$
DECLARE
    max_peer_up_id integer;
BEGIN
    SELECT max(id_peer_up)
    INTO max_peer_up_id
    FROM event_peer_up
    WHERE timestamp_arrival <= max_timestamp AND id_peer_up > min_id_peer_up;

    IF max_peer_up_id IS NULL THEN
      SELECT 0 INTO max_peer_up_id;
    END IF;

    return max_peer_up_id;

END;
$$;

DROP FUNCTION IF EXISTS get_max_peer_down_id(max_timestamp integer, min_id_peer_down integer);
CREATE OR REPLACE FUNCTION get_max_peer_down_id(max_timestamp integer, min_id_peer_down integer)
RETURNS integer
LANGUAGE plpgsql
AS
$$
DECLARE
    max_peer_down_id integer;
BEGIN
    SELECT max(id_peer_down)
    INTO max_peer_down_id
    FROM event_peer_down
    WHERE timestamp_arrival <= max_timestamp AND id_peer_down > min_id_peer_down;

    IF max_peer_down_id IS NULL THEN
      SELECT 0 INTO max_peer_down_id;
    END IF;

    return max_peer_down_id;
END;
$$;

DROP FUNCTION IF EXISTS save_snapshot_peering_info(max_timestamp integer, _max_peer_up_id integer, _max_peer_down_id integer);
CREATE OR REPLACE FUNCTION save_snapshot_peering_info(max_timestamp integer, _max_peer_up_id integer, _max_peer_down_id integer)
RETURNS integer
LANGUAGE plpgsql
AS
$$
DECLARE
    _id_peering_info integer;
BEGIN
    INSERT INTO snapshot_peering_info
            (timestamp_start, timestamp_analyzed, max_peer_up_id, max_peer_down_id)
    VALUES  (NOW(),           max_timestamp,      _max_peer_up_id, _max_peer_down_id)
    RETURNING id_peering_info
    INTO _id_peering_info;

    return _id_peering_info;
END;
$$;

DROP FUNCTION IF EXISTS update_snapshot_peering_info(_id_peering_info integer);
CREATE OR REPLACE FUNCTION update_snapshot_peering_info(_id_peering_info integer)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    UPDATE snapshot_peering_info
    SET timestamp_end = NOW()
    WHERE id_peering_info = _id_peering_info;
END;
$$;

DROP FUNCTION IF EXISTS compute_snapshot_peering(max_id_peer_up integer, min_id_peer_up integer, max_id_peer_down integer, min_id_peer_down integer, base_snapshot_info_id integer, curr_snapshot_info_id integer);
CREATE OR REPLACE FUNCTION compute_snapshot_peering(max_id_peer_up integer, min_id_peer_up integer, max_id_peer_down integer, min_id_peer_down integer, base_snapshot_info_id integer, curr_snapshot_info_id integer)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    WITH
    prev_status AS (
        SELECT *
        FROM snapshot_peering
        WHERE id_peering_info = base_snapshot_info_id
    ),
    new_up_distinct AS (
        SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, rd, bgp_id, local_ip) *, CASE WHEN "timestamp" IS NULL THEN timestamp_arrival ELSE "timestamp" END AS timestamp_comparison
        FROM event_peer_up
        WHERE id_peer_up <= max_id_peer_up AND id_peer_up > min_id_peer_up
        ORDER BY bmp_router, peer_ip, peer_asn, peer_type, rd, bgp_id, local_ip, timestamp_comparison DESC
    ),
    new_down_distinct AS (
        SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, rd) *, CASE WHEN "timestamp" IS NULL THEN timestamp_arrival ELSE "timestamp" END AS timestamp_comparison
        FROM event_peer_down
        WHERE id_peer_down <= max_id_peer_down AND id_peer_down > min_id_peer_down
        ORDER BY bmp_router, peer_ip, peer_asn, peer_type, rd, timestamp_comparison DESC
    ),
    merged AS (
        SELECT id_peer_up, id_peer_down, seq, "timestamp", timestamp_event, timestamp_arrival, timestamp_comparison, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, reason_type, reason_str, reason_loc_code, timestamp_database
        FROM prev_status
        UNION ALL
        SELECT id_peer_up, NULL AS id_peer_down, seq, "timestamp", timestamp_event, timestamp_arrival, timestamp_comparison, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, NULL AS reason_type, NULL AS reason_str, NULL AS reason_loc_code, timestamp_database
        FROM new_up_distinct
        UNION ALL
        SELECT NULL AS id_peer_up, id_peer_down, seq, "timestamp", timestamp_event, timestamp_arrival, timestamp_comparison, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, NULL AS is_in, NULL AS is_filtered, NULL AS is_loc, NULL AS is_post, NULL AS is_out, rd, NULL AS bgp_id, NULL AS local_port, NULL AS remote_port, NULL AS local_ip, NULL AS bmp_peer_up_info_string, reason_type, reason_str, reason_loc_code, timestamp_database
        FROM new_down_distinct
    ),
    merged_distinct AS (
        SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, rd) *
        FROM merged
        ORDER BY bmp_router, peer_ip, peer_asn, peer_type, rd, timestamp_comparison DESC
    )
    INSERT INTO snapshot_peering(id_peering_info, id_peer_up, id_peer_down, seq, "timestamp", timestamp_event, timestamp_arrival, timestamp_comparison, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, reason_type, reason_str, reason_loc_code)
    SELECT curr_snapshot_info_id AS id_peering_info, id_peer_up, id_peer_down, seq, "timestamp", timestamp_event, timestamp_arrival, timestamp_comparison, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, reason_type, reason_str, reason_loc_code
    FROM merged_distinct;
END;
$$;



DROP FUNCTION IF EXISTS compute_latest_snapshot_peering();
CREATE OR REPLACE FUNCTION compute_latest_snapshot_peering()
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
    max_timestamp integer;

    max_id_peer_up integer;
    min_id_peer_up integer;
    max_id_peer_down integer;
    min_id_peer_down integer;
    prev_snapshot_info_id integer;
    curr_snapshot_info_id integer;
BEGIN
    SELECT id_peering_info, max_peer_up_id, max_peer_down_id FROM get_last_snapshot_info_peering() INTO prev_snapshot_info_id, min_id_peer_up, min_id_peer_down;

    SELECT new_snapshot_timestamp() INTO max_timestamp;

    SELECT get_max_peer_up_id(max_timestamp, min_id_peer_up) INTO max_id_peer_up;
    SELECT get_max_peer_down_id(max_timestamp, min_id_peer_down) INTO max_id_peer_down;

    IF max_id_peer_up < min_id_peer_up THEN
      SELECT min_id_peer_up INTO max_id_peer_up;
    END IF;

    IF max_id_peer_down < min_id_peer_down THEN
      SELECT min_id_peer_down INTO max_id_peer_down;
    END IF;

    SELECT save_snapshot_peering_info(max_timestamp, max_id_peer_up, max_id_peer_down) INTO curr_snapshot_info_id;

    PERFORM compute_snapshot_peering(max_id_peer_up, min_id_peer_up, max_id_peer_down, min_id_peer_down, prev_snapshot_info_id, curr_snapshot_info_id);

    PERFORM update_snapshot_peering_info(curr_snapshot_info_id);
END;
$$;
