DROP FUNCTION IF EXISTS new_snapshot_timestamp();
CREATE OR REPLACE FUNCTION new_snapshot_timestamp()
RETURNS integer AS $$ SELECT extract(epoch FROM NOW())::integer $$ LANGUAGE sql;
