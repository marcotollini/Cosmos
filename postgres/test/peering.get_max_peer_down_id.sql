BEGIN;
SELECT plan(7);

SELECT has_function('get_max_peer_down_id', 'get_max_peer_down_id - should exsists');

SELECT results_eq(
    'SELECT get_max_peer_down_id(100, 0)',
    $$VALUES (0::integer)$$,
    'get_max_peer_down_id - should return default values'
);

INSERT INTO event_peer_down(id_peer_down, seq, timestamp_arrival, event_type, bmp_router, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, reason_type) VALUES(1, 1, 50, '', '', '', '', '', 0, 0, 0);


SELECT results_eq(
    'SELECT get_max_peer_down_id(100, 0)',
    $$VALUES (1::integer)$$,
    'get_max_peer_down_id - should return the value from table'
);

SELECT results_eq(
    'SELECT get_max_peer_down_id(20, 0)',
    $$VALUES (0::integer)$$,
    'get_max_peer_down_id - should return default - timestamp too small'
);

SELECT results_eq(
    'SELECT get_max_peer_down_id(100, 2)',
    $$VALUES (0::integer)$$,
    'get_max_peer_down_id - should return default - id too big'
);

SELECT results_eq(
    'SELECT get_max_peer_down_id(50, 0)',
    $$VALUES (1::integer)$$,
    'get_max_peer_down_id - should return match - timestamp limit'
);

SELECT results_eq(
    'SELECT get_max_peer_down_id(20, 1)',
    $$VALUES (0::integer)$$,
    'get_max_peer_down_id - should return default - id limit'
);


SELECT * FROM finish();
ROLLBACK;