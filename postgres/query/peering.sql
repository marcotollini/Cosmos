DROP FUNCTION IF EXISTS get_last_snapshot_peer_up_info();
CREATE OR REPLACE FUNCTION get_last_snapshot_peer_up_info()
RETURNS "snapshot_peer_up_info"
LANGUAGE plpgsql
AS
$$
DECLARE
    latest_info "snapshot_peer_up_info";
BEGIN
    SELECT *
    INTO latest_info
    FROM snapshot_peer_up_info
    WHERE id_peer_up_info = (SELECT max(id_peer_up_info) FROM snapshot_peer_up_info);

    IF latest_info."timestamp_analyzed" IS NULL THEN
      SELECT 0, 0
      INTO latest_info."timestamp_analyzed", latest_info."max_peer_up_id";
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


DROP FUNCTION IF EXISTS get_next_id_snapshot_peer_up_info();
CREATE OR REPLACE FUNCTION get_next_id_snapshot_peer_up_info()
RETURNS integer AS $$ SELECT nextval('event_peer_up_id_peer_up_seq')::integer $$ LANGUAGE sql;



DROP FUNCTION IF EXISTS save_snapshot_peer_up_info(_id_peer_up_info integer, _timestamp_start timestamptz, _timestamp_end timestamptz, _timestamp_analyzed integer, _max_peer_up_id bigint);
CREATE OR REPLACE FUNCTION save_snapshot_peer_up_info(_id_peer_up_info integer, _timestamp_start timestamptz, _timestamp_end timestamptz, _timestamp_analyzed integer, _max_peer_up_id bigint)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    INSERT INTO snapshot_peer_up_info (id_peer_up_info, timestamp_start, timestamp_end, timestamp_analyzed, max_peer_up_id)
    VALUES  (_id_peer_up_info, _timestamp_start, _timestamp_end, _timestamp_analyzed, _max_peer_up_id);
END;
$$;


DROP FUNCTION IF EXISTS compute_snapshot_peer_up(max_id_peer_up integer, min_id_peer_up integer, prev_snapshot_info_id integer, curr_snapshot_info_id integer);
CREATE OR REPLACE FUNCTION compute_snapshot_peer_up(max_id_peer_up integer, min_id_peer_up integer, prev_snapshot_info_id integer, curr_snapshot_info_id integer)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    WITH
    prev_status AS (
        SELECT *
        FROM snapshot_peer_up
        WHERE id_peer_up_info = prev_snapshot_info_id
    ),
    new_up_distinct AS (
        SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
        FROM event_peer_up
        WHERE id_peer_up <= max_id_peer_up AND id_peer_up > min_id_peer_up
        ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
    ),
    merged AS (
        SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
        FROM prev_status
        UNION ALL
        SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
        FROM new_up_distinct
    ),
    merged_distinct AS (
        SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
        FROM merged
        ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
    )
    INSERT INTO snapshot_peer_up(id_peer_up_info, id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database)
    SELECT curr_snapshot_info_id AS id_peer_up_info, id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM merged_distinct;
END;
$$;



DROP FUNCTION IF EXISTS compute_latest_snapshot_peer_up();
CREATE OR REPLACE FUNCTION compute_latest_snapshot_peer_up()
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
    max_timestamp integer;

    _timestamp_start timestamptz;
    _timestamp_end timestamptz;

    max_id_peer_up integer;
    min_id_peer_up integer;
    max_id_peer_down integer;
    min_id_peer_down integer;
    prev_snapshot_info_id integer;
    curr_snapshot_info_id integer;
BEGIN
    SELECT NOW() INTO _timestamp_start;

    SELECT id_peer_up_info, max_peer_up_id, max_peer_down_id FROM get_last_snapshot_peer_up_info() INTO prev_snapshot_info_id, min_id_peer_up, min_id_peer_down;

    SELECT new_snapshot_timestamp() INTO max_timestamp;

    SELECT get_max_peer_up_id(max_timestamp, min_id_peer_up) INTO max_id_peer_up;

    IF max_id_peer_up < min_id_peer_up THEN
      SELECT min_id_peer_up INTO max_id_peer_up;
    END IF;

    IF max_id_peer_down < min_id_peer_down THEN
      SELECT min_id_peer_down INTO max_id_peer_down;
    END IF;

    SELECT get_next_id_snapshot_peer_up_info() INTO curr_snapshot_info_id;

    PERFORM compute_snapshot_peer_up(max_id_peer_up, min_id_peer_up, max_id_peer_down, min_id_peer_down, prev_snapshot_info_id, curr_snapshot_info_id);

    SELECT NOW() INTO _timestamp_end;
    PERFORM save_snapshot_peer_up_info(curr_snapshot_info_id, _timestamp_start, _timestamp_end, max_timestamp, max_id_peer_up);
END;
$$;


DROP FUNCTION IF EXISTS test_insert_speed();
CREATE OR REPLACE FUNCTION test_insert_speed()
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
     for counter in 1..10000 loop
         INSERT INTO event_peer_up(seq,                               "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, is_in, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip)
         VALUES                   (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'c', 'b2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'd', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'f', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'g', 'c2',   10,         30,         'a2'),
                                  (floor(random() * 10000 + 1)::int,   floor(random() * 10000 + 1)::int, 110, '', floor(random() * 1000 + 1)::character varying(32),        '',           '',        floor(random() * 1000 + 1)::character varying(32),     100,      1,         false, false, true,      true,  'h', 'c2',   10,         30,         'a2');
     end loop;
 END;
 $$;
--  select compute_snapshot_peer_up(100002, 0, 0, 1)

