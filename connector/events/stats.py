# [
#     {"name":"seq","type":"long"},
#     {"name":"timestamp","type":"string"},
#     {"name":"event_type","type":"string"},
#     {"name":"event_timestamp","type":["null","string"]},
#     {"name":"bmp_router","type":"string"},
#     {"name":"bmp_router_port","type":"int"},
#     {"name":"bmp_msg_type","type":"string"},
#     {"name":"writer_id","type":"string"},
#     {"name":"peer_ip","type":"string"},
#     {"name":"peer_asn","type":"long"},
#     {"name":"peer_type","type":"int"},
#     {"name":"peer_type_str","type":"string"},
#     {"name":"is_filtered","type":["null","int"]},
#     {"name":"is_loc","type":["null","int"]},
#     {"name":"is_post","type":["null","int"]},
#     {"name":"is_out","type":["null","int"]},
#     {"name":"rd","type":["null","string"]},
#     {"name":"counter_type","type":"int"},
#     {"name":"counter_type_str","type":"string"},
#     {"name":"counter_value","type":"long"},
#     {"name":"afi","type":["null","int"]},
#     {"name":"safi","type":["null","int"]}
# ]
# {
#     'seq': 3847,
#     'timestamp': '2021-01-05T15:38:25.168237Z',
#     'event_type': 'log',
#     'event_timestamp': None,
#     'bmp_router': '192.0.2.72',
#     'bmp_router_port': 56450,
#     'bmp_msg_type': 'stats',
#     'writer_id': 'ietfint_nfacctd-bmp01_c/1',
#     'peer_ip': '2001:db8:22::153',
#     'peer_asn': 65000,
#     'peer_type': 1,
#     'peer_type_str': '',
#     'is_filtered': None,
#     'is_loc': None,
#     'is_post': None,
#     'is_out': None,
#     'rd': '0:64499:52',
#     'counter_type': 17,
#     'counter_type_str': 'Number of routes in per-AFI/SAFI Abj-RIB-Out Post-Policy',
#     'counter_value': 0,
#     'afi': None,
#     'safi': None
# }

def stats(msg_value):
    table = 'event_stats'
    time = lambda x: x['event_timestamp'] if 'event_timestamp' in x and x['event_timestamp'] is not None else x['timestamp']
    insert_filter = [
        'timestamp',
        'event_timestamp',
        'bmp_router',
        'bmp_router_port',
        'rd',
        'peer_ip',
        'peer_asn',
        'peer_type',
        'is_filtered',
        'is_loc',
        'is_post',
        'is_out',
        'counter_type',
        'counter_value',
        'afi',
        'safi',
        'seq'
    ]

    msg_mod = {k: msg_value[k] for k in msg_value if k in insert_filter}
    msg_mod['__time'] = time(msg_mod)

    msg_mod['is_filtered'] = msg_mod['is_filtered'] if msg_mod['is_filtered'] is None else bool(msg_mod['is_filtered'])
    msg_mod['is_loc'] = msg_mod['is_loc'] if msg_mod['is_loc'] is None else bool(msg_mod['is_loc'])
    msg_mod['is_post'] = msg_mod['is_post'] if msg_mod['is_post'] is None else bool(msg_mod['is_post'])
    msg_mod['is_out'] = msg_mod['is_out'] if msg_mod['is_out'] is None else bool(msg_mod['is_out'])

    return table, msg_mod