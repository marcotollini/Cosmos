BEGIN;
SELECT plan(1);

SELECT has_function('new_snapshot_timestamp', 'new_snapshot_timestamp - should exsists');

SELECT * FROM finish();
ROLLBACK;