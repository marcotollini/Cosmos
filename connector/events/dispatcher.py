from events.log_init import log_init
from events.peer_up import peer_up
from events.peer_down import peer_down
from events.init import init
from events.route_monitor import route_monitor
from events.stats import stats
from events.log_close import log_close
from events.term import term

def dispatcher_bmp(msg_value):
    if msg_value['event_type'] == 'log_init':
        return log_init(msg_value)

    # if msg_value['event_type'] == 'log_close':
    #     return log_init(msg_value)

    if msg_value['event_type'] == 'log' and msg_value['bmp_msg_type'] == 'peer_up':
        return peer_up(msg_value)

    if msg_value['event_type'] == 'log' and msg_value['bmp_msg_type'] == 'peer_down':
        return peer_down(msg_value)

    if msg_value['event_type'] == 'log' and msg_value['bmp_msg_type'] == 'init':
        return init(msg_value)

    if msg_value['event_type'] == 'log' and msg_value['bmp_msg_type'] == 'route_monitor':
        return route_monitor(msg_value)

    if msg_value['event_type'] == 'log' and msg_value['bmp_msg_type'] == 'stats':
        return stats(msg_value)

    # if msg_value['event_type'] == 'log' and msg_value['bmp_msg_type'] == 'term':
    #     return term(msg_value)


    raise Exception(f'Dispatcher BMP: unknown packet: "{msg_value}"')

def dispatcher_ipfix(msg_value):
    return

def dispatch(msg_topic, msg_value):
    if msg_topic == 'nfacctd_bmp':
        return dispatcher_bmp(msg_value)
    if msg_topic == 'nfacctd_ipfix':
        return dispatcher_ipfix(msg_value)

    raise Exception(f'Dispatcher: topic unknown "{msg_topic}"')


