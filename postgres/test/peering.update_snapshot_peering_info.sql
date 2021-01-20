BEGIN;
SELECT plan(2);

SELECT has_function('update_snapshot_peering_info', 'update_snapshot_peering_info - should exsists');
-- update_snapshot_peering_info(_id_peering_info integer);

INSERT INTO snapshot_peering_info(timestamp_start, timestamp_analyzed, max_peer_up_id, max_peer_down_id)
                        VALUES  (NOW(),           100,                20,             30);

SELECT update_snapshot_peering_info(nextval('snapshot_peering_info_id_peering_info_seq')::integer -1);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info WHERE id_peering_info = ' || nextval('snapshot_peering_info_id_peering_info_seq')::integer -2 || ' AND timestamp_end <= NOW() AND timestamp_end >= NOW() - INTERVAL ''1 seconds''',
    $$VALUES (1::bigint)$$,
    'update_snapshot_peering_info - should have the correct timestamp_end'
);


SELECT * FROM finish();
ROLLBACK;