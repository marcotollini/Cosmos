-- Uses event_list_snapshot to create snapshot and snapshot info tables for each event

-- DROP FUNCTION IF EXISTS setup_snapshot_indexes();
CREATE OR REPLACE FUNCTION setup_snapshot_indexes()
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
    _original_table_name text;
    _name_snapshot_table text;
    _name_snapshot_info_table text;

    _name_snapshot_id text;
    _name_snapshot_info_id text;
    _name_snapshot_info_max_id text;

BEGIN
    FOR _original_table_name IN
       SELECT * FROM jsonb_array_elements_text(event_list_snapshot())
    LOOP

        _name_snapshot_table := name_snapshot_table(_original_table_name);
        _name_snapshot_info_table := name_snapshot_info_table(_original_table_name);

        _name_snapshot_id := name_snapshot_id(_original_table_name);
        _name_snapshot_info_id := name_snapshot_info_id(_original_table_name);
        _name_snapshot_info_max_id := name_snapshot_info_max_id(_original_table_name);

        EXECUTE 'CREATE INDEX ON ' || _name_snapshot_table || '('|| _name_snapshot_id || ');';
        EXECUTE 'CREATE INDEX ON ' || _name_snapshot_info_table || '('|| _name_snapshot_info_id ||');';
    END LOOP;
END;
$$;


SELECT setup_snapshot_indexes();