# [
#     {"name":"seq","type":"long"},
#     {"name":"timestamp","type":"string"},
#     {"name":"event_type","type":"string"},
#     {"name":"event_timestamp","type":["null","string"]},
#     {"name":"bmp_router","type":"string"},
#     {"name":"bmp_router_port","type":"int"},
#     {"name":"bmp_msg_type","type":"string"},
#     {"name":"writer_id","type":"string"},
#     {"name":"bmp_term_info_string","type":["null","string"]},
#     {"name":"bmp_term_info_reason","type":["null","string"]}
# ]
def term(msg_value):
    print(msg_value)
    return