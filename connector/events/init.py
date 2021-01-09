#  {
#     'seq': 233,
#     'timestamp': '2021-01-05T15:38:33.475723Z',
#     'event_type': 'log',
#     'event_timestamp': None,
#     'bmp_router': '192.0.2.81',
#     'bmp_router_port': 55659,
#     'bmp_msg_type': 'init',
#     'writer_id': 'ietfint_nfacctd-bmp01_c/1',
#     'bmp_init_info_string': None,
#     'bmp_init_info_sysdescr': 'Huawei Versatile Routing Platform Software VRP (R) software, Version 8.201 (NE40E V800R013C00SPC006T) Copyright (C) 2012-2020 Huawei Technologies Co., Ltd. HUAWEI NE40E-M2K-B',
#     'bmp_init_info_sysname': 'ipf-zbl1843-r-daisy-81'
# }

# {
#     "name":"seq","type":"long"},
#     {"name":"timestamp","type":"string"},
#     {"name":"timestamp_event","type":["null","string"]},
#     {"name":"timestamp_arrival","type":["null","string"]},
#     {"name":"event_type","type":"string"},
#     {"name":"bmp_router","type":"string"},
#     {"name":"bmp_router_port","type":["null","int"]},
#     {"name":"bmp_msg_type","type":"string"},
#     {"name":"writer_id","type":"string"},
#     {"name":"bmp_init_info_string","type":["null","string"]},
#     {"name":"bmp_init_info_sysdescr","type":["null","string"]},
#     {"name":"bmp_init_info_sysname","type":["null","string"]
# }

def init(msg_value):
    table = 'event_init'
    time = lambda x: x['event_timestamp'] if 'event_timestamp' in x and x['event_timestamp'] is not None else x['timestamp']
    insert_filter = [
        'timestamp',
        'event_timestamp',
        'bmp_router',
        'bmp_router_port',
        'bmp_init_info_sysname',
        'bmp_init_info_string',
        'bmp_init_info_sysdescr',
        'seq'
    ]

    msg_mod = {k: msg_value[k] for k in msg_value if k in insert_filter}
    msg_mod['__time'] = time(msg_mod)

    return table, msg_mod