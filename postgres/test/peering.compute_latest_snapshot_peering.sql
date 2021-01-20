BEGIN;
SELECT plan(14);

SELECT has_function('compute_latest_snapshot_peering', 'compute_latest_snapshot_peering - should exsists');
-- compute_latest_snapshot_peering();


SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (1::bigint)$$,
    'compute_latest_snapshot_peering - should save but do nothing (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering',
    $$VALUES (0::bigint)$$,
    'compute_latest_snapshot_peering - should save but do nothing (pt.2)'
);


INSERT INTO event_peer_up(id_peer_up, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, is_in, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip)
VALUES                   (1,          1,   10,         11,                '',         'a',        '',           '',        'b',     100,      1,         false, false, true,      true,  'c', 'b2',   10,         20,         'a2');

SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (2::bigint)$$,
    'compute_latest_snapshot_peering - should have peer up (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info) AND id_peer_up = 1',
    $$VALUES (1::bigint)$$,
    'compute_latest_snapshot_peering - should have peer up (pt.2)'
);


SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (3::bigint)$$,
    'compute_latest_snapshot_peering - should use old state peer up (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info) AND id_peer_up = 1',
    $$VALUES (1::bigint)$$,
    'compute_latest_snapshot_peering - should use old state peer up (pt.2)'
);


INSERT INTO event_peer_down(id_peer_down, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, rd, reason_type)
VALUES                     (1,              1,  9,         12,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10);

SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (4::bigint)$$,
    'compute_latest_snapshot_peering - should use old state peer up and peer_down has timestamp too small (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info) AND id_peer_up = 1',
    $$VALUES (1::bigint)$$,
    'compute_latest_snapshot_peering - should use old state peer up and peer_down has timestamp too small (pt.2)'
);

INSERT INTO event_peer_down(id_peer_down, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, rd, reason_type)
VALUES                     (2,              1,  12,        12,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10);

SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (5::bigint)$$,
    'compute_latest_snapshot_peering - should use old state peer up and peer_down has timestamp should delete it (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info) AND id_peer_up = 1',
    $$VALUES (0::bigint)$$,
    'compute_latest_snapshot_peering - should use old state peer up and peer_down has timestamp should delete it (pt.2)'
);

SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (6::bigint)$$,
    'compute_latest_snapshot_peering - should return nothing (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info) AND id_peer_up = 1',
    $$VALUES (0::bigint)$$,
    'compute_latest_snapshot_peering - should return nothing (pt.2)'
);


INSERT INTO event_peer_down(id_peer_down, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, rd, reason_type)
VALUES                     (2,              1,  9,         12,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10);

SELECT compute_latest_snapshot_peering();

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering_info',
    $$VALUES (7::bigint)$$,
    'compute_latest_snapshot_peering - should return nothing (pt.1)'
);

-- ERROREEEEEEEEEEEEEEEEEEEEEEEEEEEEE, fixable by calc the state of now - 1 minutes (or more)
SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = (SELECT max(id_peering_info) FROM snapshot_peering_info) AND id_peer_up = 2',
    $$VALUES (0::bigint)$$,
    'compute_latest_snapshot_peering - should return nothing (pt.2)'
);


SELECT * FROM finish();
ROLLBACK;