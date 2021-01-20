BEGIN;
SELECT plan(5);

SELECT has_function('get_last_snapshot_info_peering', 'get_last_snapshot_info_peering - should exsists');

SELECT results_eq(
    'SELECT timestamp_analyzed, max_peer_up_id, max_peer_down_id FROM get_last_snapshot_info_peering()',
    $$VALUES (0::integer, 0::bigint, 0::bigint)$$,
    'get_last_snapshot_info_peering - should return default values'
);

INSERT INTO snapshot_peering_info(id_peering_info, timestamp_start, timestamp_end, timestamp_analyzed, max_peer_up_id, max_peer_down_id) VALUES (1, NOW(), NULL, 10, 100, 5);


SELECT results_eq(
    'SELECT timestamp_analyzed, max_peer_up_id, max_peer_down_id FROM get_last_snapshot_info_peering()',
    $$VALUES (10::integer, 100::bigint, 5::bigint)$$,
    'get_last_snapshot_info_peering - should return the last val (1)'
);

INSERT INTO snapshot_peering_info(id_peering_info, timestamp_start, timestamp_end, timestamp_analyzed, max_peer_up_id, max_peer_down_id) VALUES (2, NOW() + INTERVAL '5 minutes', NULL, 11, 101, 6);

SELECT results_eq(
    'SELECT timestamp_analyzed, max_peer_up_id, max_peer_down_id FROM get_last_snapshot_info_peering()',
    $$VALUES (11::integer, 101::bigint, 6::bigint)$$,
    'get_last_snapshot_info_peering - should return the last val (2)'
);

INSERT INTO snapshot_peering_info(id_peering_info, timestamp_start, timestamp_end, timestamp_analyzed, max_peer_up_id, max_peer_down_id) VALUES (2, NOW(), NULL, 12, 102, 7);

SELECT results_eq(
    'SELECT timestamp_analyzed, max_peer_up_id, max_peer_down_id FROM get_last_snapshot_info_peering()',
    $$VALUES (11::integer, 101::bigint, 6::bigint)$$,
    'get_last_snapshot_info_peering - should return the last val (3)'
);



SELECT * FROM finish();
ROLLBACK;