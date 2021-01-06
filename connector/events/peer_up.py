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
#     {"name":"peer_type_str","type":["null","string"]},
#     {"name":"is_filtered","type":["null","int"]},
#     {"name":"is_loc","type":["null","int"]},
#     {"name":"is_post","type":["null","int"]},
#     {"name":"is_out","type":["null","int"]},
#     {"name":"rd","type":["null","string"]},
#     {"name":"bgp_id","type":"string"},
#     {"name":"local_port","type":"int"},
#     {"name":"remote_port","type":"int"},
#     {"name":"local_ip","type":"string"},
#     {"name":"bmp_peer_up_info_0","type":["null","string"]}
# ]
# {
#     'seq': 282,
#     'timestamp': '2020-12-02T16:32:19.651000Z',
#     'event_type': 'log',
#     'event_timestamp': None,
#     'bmp_router': '192.0.2.81',
#     'bmp_router_port': 55659,
#     'bmp_msg_type': 'peer_up',
#     'writer_id': 'ietfint_nfacctd-bmp01_c/1',
#     'peer_ip': '2001:db8:13::151',
#     'peer_asn': 65000,
#     'peer_type': 1,
#     'peer_type_str': 'RD Instance Peer',
#     'is_filtered': None,
#     'is_loc': None,
#     'is_post': 1,
#     'is_out': 1,
#     'rd': '0:64499:31',
#     'bgp_id': '203.0.113.12',
#     'local_port': 179,
#     'remote_port': 61457,
#     'local_ip': '2001:db8:13::181',
#     'bmp_peer_up_info_0': None
# }
def peer_up(msg_value):
    table = 'event_peer_up'
    time = lambda x: x['event_timestamp'] if 'event_timestamp' in x and x['event_timestamp'] is not None else x['timestamp']
    insert_filter = [
        'timestamp',
        'event_timestamp',
        'bmp_router',
        'bmp_router_port',
        'rd',
        'local_ip'
        'bgp_id', # of remote
        'peer_ip',
        'peer_asn',
        'peer_type',
        'is_filtered',
        'is_loc',
        'is_post',
        'is_out',
        'local_port',
        'remote_port',
        'seq'
    ]

    msg_mod = {k: msg_value[k] for k in msg_value if k in insert_filter}
    msg_mod['__time'] = time(msg_mod)

    msg_mod['is_filtered'] = msg_mod['is_filtered'] if msg_mod['is_filtered'] is None else bool(msg_mod['is_filtered'])
    msg_mod['is_loc'] = msg_mod['is_loc'] if msg_mod['is_loc'] is None else bool(msg_mod['is_loc'])
    msg_mod['is_post'] = msg_mod['is_post'] if msg_mod['is_post'] is None else bool(msg_mod['is_post'])
    msg_mod['is_out'] = msg_mod['is_out'] if msg_mod['is_out'] is None else bool(msg_mod['is_out'])

    return table, msg_mod