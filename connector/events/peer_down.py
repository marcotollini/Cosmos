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
#     {"name":"rd","type":["null","string"]},
#     {"name":"reason_type","type":"int"},
#     {"name":"reason_str","type":["null","string"]},
#     {"name":"reason_loc_code","type":["null","int"]}
# ]
# {
#     'seq': 885,
#     'timestamp': '2021-01-05T21:08:22.510000Z',
#     'event_type': 'log',
#     'event_timestamp': None,
#     'bmp_router': '192.0.2.52',
#     'bmp_router_port': 64141,
#     'bmp_msg_type': 'peer_down',
#     'writer_id': 'ietfint_nfacctd-bmp01_c/1',
#     'peer_ip': '192.0.2.81',
#     'peer_asn': 65541,
#     'peer_type': 0,
#     'peer_type_str': 'Global Instance Peer',
#     'rd': None,
#     'reason_type': 3,
#     'reason_str': 'The remote system closed the session',
#     'reason_loc_code': None
# }
def peer_down(msg_value):
    table = 'event_peer_down'
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
        'reason_type',
        'seq'
    ]

    msg_mod = {k: msg_value[k] for k in msg_value if k in insert_filter}
    msg_mod['__time'] = time(msg_mod)

    return table, msg_mod