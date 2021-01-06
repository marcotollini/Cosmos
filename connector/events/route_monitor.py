# [
#     {"name":"log_type","type":"string"},
#     {"name":"seq","type":"long"},
#     {"name":"timestamp","type":"string"},
#     {"name":"event_type","type":"string"},
#     {"name":"writer_id","type":"string"},
#     {"name":"afi","type":"int"},
#     {"name":"safi","type":"int"},
#     {"name":"ip_prefix","type":["null","string"]},
#     {"name":"rd","type":["null","string"]},
#     {"name":"bgp_nexthop","type":["null","string"]},
#     {"name":"as_path","type":["null","string"]},
#     {"name":"as_path_id","type":["null","int"]},
#     {"name":"comms","type":["null","string"]},
#     {"name":"ecomms","type":["null","string"]},
#     {"name":"lcomms","type":["null","string"]},
#     {"name":"origin","type":["null","string"]},
#     {"name":"local_pref","type":["null","int"]},
#     {"name":"med","type":["null","int"]},
#     {"name":"label","type":["null","string"]},
#     {"name":"peer_ip","type":"string"},
#     {"name":"peer_tcp_port","type":["null","int"]},
#     {"name":"bmp_router","type":"string"},
#     {"name":"bmp_router_port","type":"int"},
#     {"name":"bmp_msg_type","type":"string"},
#     {"name":"is_filtered","type":["null","int"]},
#     {"name":"is_loc","type":["null","int"]},
#     {"name":"is_post","type":["null","int"]},
#     {"name":"is_out","type":["null","int"]}
# ]
#  {
#     'log_type': 'update',
#     'seq': 44815,
#     'timestamp': '2020-12-29T13:50:01.000000Z',
#     'event_type': 'log',
#     'writer_id': 'ietfint_nfacctd-bmp01_c/1',
#     'afi': 2,
#     'safi': 1,
#     'ip_prefix': '2001:db8::21/128',
#     'rd': None,
#     'bgp_nexthop': '2001:db8:12::172',
#     'as_path': '65540 65000',
#     'as_path_id': None,
#     'comms': '64496:299 64496:1001 64496:1033 64497:1 64499:11',
#     'ecomms': None,
#     'lcomms': None,
#     'origin': 'i',
#     'local_pref': 0,
#     'med': None,
#     'label': None,
#     'peer_ip': '2001:db8:12::155',
#     'peer_tcp_port': 0,
#     'bmp_router': '192.0.2.72',
#     'bmp_router_port': 56450,
#     'bmp_msg_type': 'route_monitor',
#     'is_filtered': None,
#     'is_loc': None,
#     'is_post': 1,
#     'is_out': 1
# }

import json

def route_monitor(msg_value):
    table = 'event_route_monitor'
    time = lambda x: x['event_timestamp'] if 'event_timestamp' in x and x['event_timestamp'] is not None else x['timestamp']
    insert_filter = [
        'timestamp',
        'event_timestamp',
        'bmp_router',
        'bmp_router_port',
        'peer_ip',
        'peer_tcp_port',
        'ip_prefix',
        'bgp_nexthop',
        'rd',
        'is_loc',
        'is_post',
        'is_out',
        'afi',
        'safi',
        'as_path',
        'as_path_id',
        'comms',
        'ecomms',
        'lcomms',
        'origin',
        'local_pref',
        'label',
        'is_filtered',
        'seq'
    ]

    msg_mod = {k: msg_value[k] for k in msg_value if k in insert_filter}
    msg_mod['__time'] = time(msg_mod)

    msg_mod['is_filtered'] = msg_mod['is_filtered'] if msg_mod['is_filtered'] is None else bool(msg_mod['is_filtered'])
    msg_mod['is_loc'] = msg_mod['is_loc'] if msg_mod['is_loc'] is None else bool(msg_mod['is_loc'])
    msg_mod['is_post'] = msg_mod['is_post'] if msg_mod['is_post'] is None else bool(msg_mod['is_post'])
    msg_mod['is_out'] = msg_mod['is_out'] if msg_mod['is_out'] is None else bool(msg_mod['is_out'])

    msg_mod['as_path'] = msg_mod['as_path'] if msg_mod['as_path'] is None else json.dumps(msg_mod['as_path'].split(' '))
    msg_mod['as_path_id'] = msg_mod['as_path_id'] if msg_mod['as_path_id'] is None else json.dumps(msg_mod['as_path_id'].split(' '))
    msg_mod['comms'] = msg_mod['comms'] if msg_mod['comms'] is None else json.dumps(msg_mod['comms'].split(' '))
    msg_mod['ecomms'] = msg_mod['ecomms'] if msg_mod['ecomms'] is None else json.dumps(msg_mod['ecomms'].split(' '))
    msg_mod['lcomms'] = msg_mod['lcomms'] if msg_mod['lcomms'] is None else json.dumps(msg_mod['lcomms'].split(' '))

    return table, msg_mod