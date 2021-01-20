
-- Givent the event table name (event_peer_up), returns the last snapshot information, among which the timestamp_analyzed and the snapshot id
-- In case of no snapshot available, returns (0,0)
-- DROP FUNCTION IF EXISTS get_last_snapshot_info(_original_table_name text);
DROP TYPE IF EXISTS last_snapshot_info;
CREATE TYPE last_snapshot_info AS (snapshot_info_id integer, timestamp_analyzed integer, max_id_snapshot bigint);
CREATE OR REPLACE FUNCTION get_last_snapshot_info(_original_table_name text)
RETURNS last_snapshot_info
LANGUAGE plpgsql
AS
$$
DECLARE
    latest_info RECORD;
    _last_snapshot_info last_snapshot_info;

    _name_snapshot_info_table text := name_snapshot_info_table(_original_table_name);

    _name_snapshot_info_id text := name_snapshot_info_id(_original_table_name);
    _name_snapshot_info_max_id text := name_snapshot_info_max_id(_original_table_name);
BEGIN
    EXECUTE '
        SELECT *
        FROM '|| _name_snapshot_info_table ||'
        WHERE '|| _name_snapshot_info_id ||' = (SELECT max('|| _name_snapshot_info_id ||') FROM '|| _name_snapshot_info_table ||');
    ' INTO latest_info;

    IF latest_info."timestamp_analyzed" IS NULL THEN
        _last_snapshot_info.snapshot_info_id := 0;
        _last_snapshot_info.timestamp_analyzed := 0;
        _last_snapshot_info.max_id_snapshot := 0;
        return _last_snapshot_info;
    END IF;

    _last_snapshot_info.snapshot_info_id := to_jsonb(latest_info)->>_name_snapshot_info_id;
    _last_snapshot_info.timestamp_analyzed := latest_info.timestamp_analyzed;
    _last_snapshot_info.max_id_snapshot := to_jsonb(latest_info)->>_name_snapshot_info_max_id;

    return _last_snapshot_info;
END;
$$;

-- Given te event table name, the upper limit of timestamp (usually now) and the minimum id of the event, returns the max id of the event
-- which is ok, or 0 in case there are no new events
-- DROP FUNCTION IF EXISTS get_max_snapshot_event_id(_original_table_name text, max_timestamp integer, min_id integer);
CREATE OR REPLACE FUNCTION get_max_snapshot_event_id(_original_table_name text, max_timestamp integer, min_id integer)
RETURNS integer
LANGUAGE plpgsql
AS
$$
DECLARE
    max_snapshot_event_id integer;
BEGIN

    EXECUTE '
        SELECT max('|| name_original_id(_original_table_name) ||')
        FROM '|| _original_table_name ||'
        WHERE timestamp_arrival <= '|| max_timestamp ||' AND '|| name_original_id(_original_table_name) ||' > ' || min_id ||';
    ' INTO max_snapshot_event_id;

    IF max_snapshot_event_id IS NULL THEN
      SELECT 0 INTO max_snapshot_event_id;
    END IF;

    RETURN max_snapshot_event_id;
END;
$$;

-- Given te event table name, finds the id of snapshot info, calculates the next value and returns it
-- DROP FUNCTION IF EXISTS get_next_id_snapshot_info(_original_table_name text);
CREATE OR REPLACE FUNCTION get_next_id_snapshot_info(_original_table_name text)
RETURNS integer
LANGUAGE plpgsql
AS
$$
DECLARE
    next_val_cmd text;
    next_val integer;
BEGIN

    SELECT column_default
    INTO next_val_cmd
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = name_snapshot_info_table(_original_table_name) AND column_name = name_snapshot_info_id(_original_table_name)
    LIMIT 1;

    EXECUTE 'SELECT ' || next_val_cmd INTO next_val;

    RETURN next_val;
END;
$$;

-- Given te event table name, the id of the snapshot information (see get_next_id_snapshot_info), the start, end, and analyzed timestamps, and the maximum id considered, save the information
-- in the corresponding snapshot_info table
-- DROP FUNCTION IF EXISTS save_snapshot_info(_original_table_name text, _id_snapshot_info integer, _timestamp_start timestamptz, _timestamp_end timestamptz, _timestamp_analyzed integer, _max_id bigint);
CREATE OR REPLACE FUNCTION save_snapshot_info(_original_table_name text, _id_snapshot_info integer, _timestamp_start timestamptz, _timestamp_end timestamptz, _timestamp_analyzed integer, _max_id bigint)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    EXECUTE '
        INSERT INTO '|| name_snapshot_info_table(_original_table_name) ||' ('|| name_snapshot_info_id(_original_table_name) ||', timestamp_start, timestamp_end, timestamp_analyzed, '|| name_snapshot_info_max_id(_original_table_name) ||')
        VALUES  ('|| _id_snapshot_info ||', '''|| _timestamp_start ||''', '''|| _timestamp_end ||''', '|| _timestamp_analyzed ||', '|| _max_id ||');
    ';
END;
$$;

-- Given te event table name, a max_id, a min_id (not included, which usually is the max of the prev snapshot info), the id of the prev_snapshot_id, the new (current) snapshot info id
-- calculate the new state and save it in the corresponding snapshot table. snapshot Info is NOT saved.
-- DROP FUNCTION IF EXISTS compute_snapshot(_original_table_name text, _max_id integer, _min_id integer, prev_snapshot_info_id integer, curr_snapshot_info_id integer);
CREATE OR REPLACE FUNCTION compute_snapshot(_original_table_name text, _max_id integer, _min_id integer, prev_snapshot_info_id integer, curr_snapshot_info_id integer)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
    _name_snapshot_table text := name_snapshot_table(_original_table_name);
    _name_snapshot_info_table text := name_snapshot_info_table(_original_table_name);

    _name_snapshot_id text := name_snapshot_id(_original_table_name);
    _name_snapshot_info_id text := name_snapshot_info_id(_original_table_name);
    _name_snapshot_info_max_id text := name_snapshot_info_max_id(_original_table_name);

    _name_original_id text := name_original_id(_original_table_name);

    _name_columns_distinct text := name_columns_distinct(_original_table_name);
    _name_columns_distinct_timestamp text := _name_columns_distinct || ', ' || name_columns_distinct_timestamp(_original_table_name);

    _name_columns_common_between_original_distinct text = name_columns_common_between_original_distinct(_original_table_name);
BEGIN
    EXECUTE '
        WITH
        prev_status AS (
            SELECT *
            FROM '|| _name_snapshot_table ||'
            WHERE '|| _name_original_id ||' = '|| prev_snapshot_info_id ||'
        ),
        new_up_distinct AS (
            SELECT DISTINCT ON ('|| _name_columns_distinct ||') *
            FROM '|| _original_table_name ||'
            WHERE '|| _name_original_id ||' <= '|| _max_id ||' AND '|| _name_original_id ||' > '|| _min_id ||'
            ORDER BY '|| _name_columns_distinct_timestamp ||'
        ),
        merged AS (
            SELECT '|| _name_columns_common_between_original_distinct ||'
            FROM prev_status
            UNION ALL
            SELECT '|| _name_columns_common_between_original_distinct ||'
            FROM new_up_distinct
        ),
        merged_distinct AS (
            SELECT DISTINCT ON ('|| _name_columns_distinct ||') *
            FROM merged
            ORDER BY '|| _name_columns_distinct_timestamp ||'
        )
        INSERT INTO '|| _name_snapshot_table ||'('|| _name_snapshot_info_id ||', '|| _name_columns_common_between_original_distinct ||')
        SELECT '|| curr_snapshot_info_id ||' AS '|| _name_snapshot_info_id ||', '|| _name_columns_common_between_original_distinct ||'
        FROM merged_distinct;
    ';
END;
$$;

-- Given te event table name, compute the new snapshot in snapshot table and creates and entry in snapshot info
-- DROP FUNCTION IF EXISTS compute_latest_snapshot(_original_table_name text);
CREATE OR REPLACE FUNCTION compute_latest_snapshot(_original_table_name text)
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
    max_timestamp integer; -- timestamp that we want to analyze (usually now())

    _timestamp_start timestamptz; -- start of the computation, for statistic
    _timestamp_end timestamptz; -- end of the computation, for statistic

    _max_id integer;
    _min_id integer;
    _prev_snapshot_info_id integer;
    _curr_snapshot_info_id integer;
BEGIN
    SELECT NOW() INTO _timestamp_start;

    RAISE NOTICE 'start %', _timestamp_start;

    SELECT snapshot_info_id, max_id_snapshot FROM get_last_snapshot_info(_original_table_name) INTO _prev_snapshot_info_id, _min_id; -- old max is new min

    SELECT new_snapshot_timestamp() INTO max_timestamp;

    SELECT get_max_snapshot_event_id(_original_table_name, max_timestamp, _min_id) INTO _max_id;

    IF _max_id < _min_id THEN
      SELECT _min_id INTO _max_id;
    END IF;


    SELECT get_next_id_snapshot_info(_original_table_name) INTO _curr_snapshot_info_id;

    PERFORM compute_snapshot(_original_table_name, _max_id, _min_id, _prev_snapshot_info_id, _curr_snapshot_info_id);

    SELECT NOW() INTO _timestamp_end;
    PERFORM save_snapshot_info(_original_table_name, _curr_snapshot_info_id, _timestamp_start, _timestamp_end, max_timestamp, _max_id);
END;
$$;

SELECT compute_latest_snapshot('event_peer_up');