DROP FUNCTION IF EXISTS new_snapshot_timestamp();
CREATE OR REPLACE FUNCTION new_snapshot_timestamp()
RETURNS integer AS $$ SELECT extract(epoch FROM NOW())::integer $$ LANGUAGE sql;

DROP FUNCTION IF EXISTS avoid_stale_peering_up();
CREATE OR REPLACE FUNCTION avoid_stale_peering_up()
RETURNS integer AS $$ SELECT extract(epoch FROM NOW() - INTERVAL '30 days')::integer $$ LANGUAGE sql;

DROP FUNCTION IF EXISTS avoid_stale_peering_down();
CREATE OR REPLACE FUNCTION avoid_stale_peering_down()
RETURNS integer AS $$ SELECT extract(epoch FROM NOW() - INTERVAL '1 days')::integer $$ LANGUAGE sql;