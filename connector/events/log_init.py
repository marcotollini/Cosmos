# [
#     {"name":"seq","type":"long"},
#     {"name":"timestamp","type":"string"},
#     {"name":"event_type","type":"string"},
#     {"name":"writer_id","type":"string"},
#     {"name":"bmp_router","type":"string"},
#     {"name":"bmp_router_port","type":["null","int"]}
# ]
# {
#     'seq': 0,
#     'timestamp': '2021-01-05T15:37:39.966806Z',
#     'event_type': 'log_init',
#     'writer_id': 'ietfint_nfacctd-bmp01_c/1',
#     'bmp_router': '192.0.2.44',
#     'bmp_router_port': 16348
# }
def log_init(msg_value):
    table = 'event_log_init'
    time = lambda x: x['timestamp']
    insert_filter = [
        'timestamp',
        'bmp_router',
        'bmp_router_port',
        'seq'
    ]

    msg_mod = {k: msg_value[k] for k in msg_value if k in insert_filter}
    msg_mod['__time'] = time(msg_mod)

    return table, msg_mod