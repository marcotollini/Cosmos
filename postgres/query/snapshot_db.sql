-- Uses event_list_snapshot to create snapshot and snapshot info tables for each event
-- DROP FUNCTION IF EXISTS setup_snapshot_tabled();
CREATE OR REPLACE FUNCTION setup_snapshot_tabled()
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

        EXECUTE 'DROP TABLE IF EXISTS ' || _name_snapshot_table || ';';
        EXECUTE '
            CREATE TABLE ' || _name_snapshot_table || ' AS
            TABLE ' || _original_table_name || '
            WITH NO DATA;
        ';

        EXECUTE 'ALTER TABLE ' || _name_snapshot_table || ' ADD COLUMN id_' || _name_snapshot_table || ' bigserial;';
        EXECUTE 'ALTER TABLE ' || _name_snapshot_table || ' ADD COLUMN id_' || _name_snapshot_info_table || ' integer;';

        EXECUTE 'DROP TABLE IF EXISTS ' || _name_snapshot_info_table || ';';
        EXECUTE
            'CREATE TABLE "public"."'|| _name_snapshot_info_table ||'" (
                "'|| _name_snapshot_info_id ||'" serial NOT NULL,
                "timestamp_start" timestamptz NOT NULL,
                "timestamp_end" timestamptz,
                "timestamp_analyzed" integer NOT NULL,
                "'|| _name_snapshot_info_max_id ||'" bigint NOT NULL
            ) WITH (oids = false);
        ';
    END LOOP;
END;
$$;


SELECT setup_snapshot_tabled();