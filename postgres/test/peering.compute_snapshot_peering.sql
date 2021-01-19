BEGIN;
SELECT plan(14);

SELECT has_function('compute_snapshot_peering', 'compute_snapshot_peering - should exsists');
-- compute_snapshot_peering(max_id_peer_up integer, min_id_peer_up integer, max_id_peer_down integer, min_id_peer_down integer, base_snapshot_info_id integer, curr_snapshot_info_id integer);

INSERT INTO event_peer_up(id_peer_up, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, is_in, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip)
VALUES                   (1,          1,   10,         11,                '',         'a',        '',           '',        'b',     100,      1,         false, false, true,      true,  'c', 'b2',   10,         20,         'a2');

SELECT compute_snapshot_peering(0, 0, 0, 0, 0, 1);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering',
    $$VALUES (0::bigint)$$,
    'compute_snapshot_peering - should do nothing'
);

SELECT compute_snapshot_peering(1, 0, 0, 0, 0, 1);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering',
    $$VALUES (1::bigint)$$,
    'compute_snapshot_peering - should contain the only peer_up'
);

SELECT results_eq(
    'SELECT id_peer_up, bmp_router FROM snapshot_peering WHERE id_peering_info = 1',
    $$VALUES (1::bigint, 'a'::character varying(32))$$,
    'compute_snapshot_peering - should contain the only peer_up with correct info'
);

SELECT compute_snapshot_peering(0, 0, 0, 0, 0, 2);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 2',
    $$VALUES (0::bigint)$$,
    'compute_snapshot_peering - should contain nothing - max_peer_up_id is too small'
);

SELECT compute_snapshot_peering(4, 1, 0, 0, 0, 3);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 3',
    $$VALUES (0::bigint)$$,
    'compute_snapshot_peering - should contain nothing - min_peer_up_id is too big'
);



INSERT INTO event_peer_up(id_peer_up, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, is_in, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip)
VALUES                   (2,          1,   100,         110,                '',         'a',        '',           '',        'b',     100,      1,         false, false, true,      true,  'c', 'b2',   10,         20,         'a2'),
                         (3,          1,   NULL,        110,                '',         'b',        '',           '',        'c',     100,      1,         false, false, true,      true,  'd', 'c2',   10,         20,         'b2');


INSERT INTO event_peer_down(id_peer_down, seq, "timestamp", timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, rd, reason_type)
VALUES                     (1,              1,  9,         12,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10),
                           (2,              1,  12,        12,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10),
                           (3,              1,  NULL,      10,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10),
                           (4,              1,  NULL,     113,                '',         'a',        '',           '',        'b',     100,      1,         'c', 10);

SELECT compute_snapshot_peering(1, 0, 0, 0, 0, 4);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 4 and id_peer_up = 1',
    $$VALUES (1::bigint)$$,
    'compute_snapshot_peering - should contain id 1 - peer_down not selected'
);

SELECT compute_snapshot_peering(1, 0, 1, 0, 0, 5);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 5 and id_peer_up = 1',
    $$VALUES (1::bigint)$$,
    'compute_snapshot_peering - should contain id 1 - timestamp down is too small'
);

SELECT compute_snapshot_peering(1, 0, 2, 0, 0, 6);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 6 and id_peer_up = 1',
    $$VALUES (0::bigint)$$,
    'compute_snapshot_peering - should not be present - timestamp down is bigger'
);

SELECT compute_snapshot_peering(1, 0, 3, 2, 0, 7);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 7 and id_peer_up = 1',
    $$VALUES (1::bigint)$$,
    'compute_snapshot_peering - should be present - timestamp_arrival down is smaller'
);

SELECT compute_snapshot_peering(1, 0, 4, 2, 0, 8);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 8 and id_peer_up = 1',
    $$VALUES (0::bigint)$$,
    'compute_snapshot_peering - should not be present - timestamp_arrival down is bigger'
);

SELECT compute_snapshot_peering(2, 0, 2, 1, 0, 9);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 9 and id_peer_up = 1',
    $$VALUES (0::bigint)$$,
    'compute_snapshot_peering - should be present - timestamp down is smaller than id 2 but bigger than 1 (pt.1)'
);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 9 and id_peer_up = 2',
    $$VALUES (1::bigint)$$,
    'compute_snapshot_peering - should be present - timestamp down is smaller than id 2 but bigger than 1 (pt.2)'
);


SELECT compute_snapshot_peering(2, 0, 4, 0, 0, 10);

SELECT results_eq(
    'SELECT count(*) FROM snapshot_peering WHERE id_peering_info = 10',
    $$VALUES (1::bigint)$$,
    'compute_snapshot_peering - should not be present - in case timestamp is null, use timestamp_arrival'
);

SELECT * FROM finish();
ROLLBACK;