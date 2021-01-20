BEGIN;
SELECT plan(5);

SELECT has_function('save_snapshot_peering_info', 'save_snapshot_peering_info - should exsists');

-- max_timestamp integer, _max_peer_up_id integer, _max_peer_down_id intege

SELECT results_eq(
    'SELECT save_snapshot_peering_info(100, 10, 20)',
    $$VALUES (nextval('snapshot_peering_info_id_peering_info_seq')::integer -1)$$,
    'save_snapshot_peering_info - should return id'
);

SELECT results_eq(
    'SELECT timestamp_analyzed, max_peer_up_id, max_peer_down_id FROM snapshot_peering_info WHERE id_peering_info = ' || nextval('snapshot_peering_info_id_peering_info_seq')::integer -2,
    $$VALUES (100::integer, 10::bigint, 20::bigint)$$,
    'save_snapshot_peering_info - should be present in table'
);

SELECT results_eq(
    'SELECT save_snapshot_peering_info(200, 11, 21)',
    $$VALUES (nextval('snapshot_peering_info_id_peering_info_seq')::integer -1)$$,
    'save_snapshot_peering_info - should return new id'
);

SELECT results_eq(
    'SELECT timestamp_analyzed, max_peer_up_id, max_peer_down_id FROM snapshot_peering_info WHERE id_peering_info = ' || nextval('snapshot_peering_info_id_peering_info_seq')::integer -2,
    $$VALUES (200::integer, 11::bigint, 21::bigint)$$,
    'save_snapshot_peering_info - should be present in table - new'
);


SELECT * FROM finish();
ROLLBACK;