-- Uses event_list_snapshot to create snapshot and snapshot info tables for each event

-- DROP FUNCTION IF EXISTS setup_timescale_snapshot_indexes();
CREATE OR REPLACE FUNCTION setup_timescale_snapshot_indexes()
RETURNS void
LANGUAGE plpgsql
AS
$$
DECLARE
    _original_table_name text;
    _name_snapshot_table text;
    _name_snapshot_info_table text;

    timescale_strategy timescale_snapshot_setup_typ;
BEGIN
    FOR _original_table_name IN
       SELECT * FROM jsonb_array_elements_text(event_list_snapshot())
    LOOP

        _name_snapshot_table := name_snapshot_table(_original_table_name);
        _name_snapshot_info_table := name_snapshot_info_table(_original_table_name);

        timescale_strategy := timescale_snapshot_setup(_original_table_name);

        PERFORM create_hypertable(_name_snapshot_table, timescale_strategy.column_name, chunk_time_interval => timescale_strategy.chunk_time_interval, migrate_data => true);
        PERFORM create_hypertable(_name_snapshot_info_table, timescale_strategy.column_name_info, chunk_time_interval => timescale_strategy.chunk_time_interval_info, migrate_data => true);
    END LOOP;
END;
$$;


SELECT setup_timescale_snapshot_indexes();