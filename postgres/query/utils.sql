-- DROP FUNCTION IF EXISTS name_snapshot_table(_original_table_name text);
CREATE OR REPLACE FUNCTION name_snapshot_table(_original_table_name text)
RETURNS text AS $$ SELECT 'snapshot_' || _original_table_name; $$ LANGUAGE sql;

-- DROP FUNCTION IF EXISTS name_snapshot_info_table(_original_table_name text);
CREATE OR REPLACE FUNCTION name_snapshot_info_table(_original_table_name text)
RETURNS text AS $$ SELECT 'snapshot_' || _original_table_name || '_info'; $$ LANGUAGE sql;

-- DROP FUNCTION IF EXISTS name_snapshot_id(_original_table_name text);
CREATE OR REPLACE FUNCTION name_snapshot_id(_original_table_name text)
RETURNS text AS $$ SELECT 'id_snapshot_' || _original_table_name; $$ LANGUAGE sql;

-- DROP FUNCTION IF EXISTS name_snapshot_info_id(_original_table_name text);
CREATE OR REPLACE FUNCTION name_snapshot_info_id(_original_table_name text)
RETURNS text AS $$ SELECT 'id_snapshot_' || _original_table_name || '_info'; $$ LANGUAGE sql;

-- DROP FUNCTION IF EXISTS name_snapshot_info_max_id(_original_table_name text);
CREATE OR REPLACE FUNCTION name_snapshot_info_max_id(_original_table_name text)
RETURNS text AS $$ SELECT 'max_id_snapshot_' || _original_table_name || '_info'; $$ LANGUAGE sql;
