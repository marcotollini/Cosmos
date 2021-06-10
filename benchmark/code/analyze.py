from os.path import join
from matplotlib import pyplot as plt
import statistics
import math
clients = [1, 8, 16, 32]
insert_tests = [1, 50, 100, 200, 400, 800]
import sys

base = '../data/'
if len(sys.argv) > 1:
    base = join(sys.argv[1])


def parse_log(p):
    with open(p, 'r') as fp:
        logs = []
        for log in fp:
            parts = log.split(' ')
            client_number = parts[0]
            transaction_no = parts[1]
            time = parts[2]
            file_no = parts[3]
            time_epoch = parts[4]
            time_us = parts[5]
            logs.append({
                'client_number': int(client_number),
                'transaction_no': int(transaction_no),
                'time': int(time),
                'file_no': int(file_no),
                'time_epoch': int(time_epoch),
                'time_us': int(time_us),
            })
    return logs

def log_time_fix(parsed):
    start_time = int(str(parsed[0]['time_epoch']) + str(parsed[0]['time_us']).ljust(9, '0'))

    for p in parsed:
        p['time_start'] = int(str(p['time_epoch']) + str(p['time_us']).ljust(9, '0')) - start_time

    return parsed

def log_bucket(parsed):
    seconds = [[]]
    bucket_time = 0
    for p in parsed:
        if p['time_start'] - bucket_time > 10**9:
            bucket_time += 10**9
            seconds.append([])
        p['time_in_bucket'] = p['time_start'] - bucket_time
        seconds[-1].append(p)
    return seconds

def plot(data, title, xlabel, ylabel, output_name):
    fig, ax = plt.subplots()
    fig.set_size_inches(14.5, 7.5)

    for d in data:
        x = d['x']
        y = d['y']
        label = d['label']
        if 'yerr' in d:
            yerr = d['yerr']
            ax.errorbar(x, y, yerr=yerr, label=label, marker='o', markersize=3)
        else:
            ax.plot(x, y, label=label, marker='o', markersize=3)

    ax.legend(loc='upper left')
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.axis([0, 120, 0, None])
    plt.savefig(join(base, 'analyzed', f'{output_name}.pdf'))
    plt.savefig(join(base, 'analyzed', f'{output_name}.png'))
    plt.clf()
    plt.close('all')


def insert_latency_plot(configurations):
    # client is fixed
    for client in clients:
        data_chart = []
        for config in configurations:
            if config['client'] != client:
                continue

            x = []
            y = []
            yerr = []
            for i in range(len(config['seconds_bucket'])):
                x.append(i)
                data = [x['time']/1000 for x in config['seconds_bucket'][i]]
                y.append(statistics.mean(data))
                yerr.append(statistics.stdev(data) if len(data) > 1 else 0)

            data_chart.append({
                'x': x,'y': y,'yerr': yerr,'label': f"{config['inserts']} batch",
            })

        plot(data=data_chart, title=f'Mean transaction latency per second for insert operation with {client} clients', xlabel='Test time [s]', ylabel='Latency [ms]', output_name=f'insert_latency_clients_{client}')

    # batch is fixed
    for it in insert_tests:
        data_chart = []
        for config in configurations:
            if config['inserts'] != it:
                continue

            x = []
            y = []
            yerr = []
            for i in range(len(config['seconds_bucket'])):
                x.append(i)
                data = [x['time']/1000 for x in config['seconds_bucket'][i]]
                y.append(statistics.mean(data))
                yerr.append(statistics.stdev(data) if len(data) > 1 else 0)

            data_chart.append({
                'x': x,'y': y,'yerr': yerr,'label': f"{config['client']} clients",
            })

        plot(data=data_chart, title=f'Mean transaction latency per second for insert operation with batch size {it}', xlabel='Test time [s]', ylabel='Latency [ms]', output_name=f'insert_latency_batch_{client}')

def insert_rate_plot(configurations):
    # client is fixes
    for client in clients:
        data_chart = []
        for config in configurations:
            if config['client'] != client:
                continue

            x = []
            y = []
            for i in range(math.ceil(len(config['seconds_bucket'])/5)):
                x.append(i*5)
                data = config['seconds_bucket'][i: i+5]
                y.append(sum([len(x) for x in data]) * config['inserts']/5)

            data_chart.append({
                'x': x,'y': y,'label': f"{config['inserts']} batch size",
            })

        plot(data=data_chart, title=f'Number of rows inserted per seconds with {client} clients', xlabel='Test time [s]', ylabel='Number of inserted rows', output_name=f'insert_count_clients_{client}')

    # batch is fixes
    for it in insert_tests:
        data_chart = []
        for config in configurations:
            if config['inserts'] != it:
                continue

            x = []
            y = []
            for i in range(math.ceil(len(config['seconds_bucket'])/5)):
                x.append(i*5)
                data = config['seconds_bucket'][i: i+5]
                y.append(sum([len(x) for x in data]) * config['inserts']/5)

            data_chart.append({
                'x': x,'y': y,'label': f"{config['client']} clients",
            })

        plot(data=data_chart, title=f'Number of rows inserted per seconds with batch size {it}', xlabel='Test time [s]', ylabel='Number of inserted rows', output_name=f'insert_count_batch_{it}')

def analyze_inserts():
    base_insert = join(base, 'tests', 'insert')
    configurations = []
    for it in insert_tests:
        for client in clients:
            test_folder = join(base_insert, f'ins_{it}', f'clients_{client}')
            stdout = join(test_folder, 'stdout.txt')
            with open(stdout, 'r') as fp:
                if 'the above results are incomplete.' in fp.read():
                    print('test', test_folder, 'is not valid (incomplete)')
                    continue
            log_file = join(test_folder, 'pgbench_log.1')
            parsed = parse_log(log_file)
            parsed = log_time_fix(parsed)
            seconds = log_bucket(parsed)
            configurations.append({
                'client': client,
                'inserts': it,
                'seconds_bucket': seconds,
                'parsed': parsed
            })

    insert_latency_plot(configurations)
    insert_rate_plot(configurations)

def qtype_latency_plot(configurations, qtype):
    data_chart = []
    for config in configurations:
        x = []
        y = []
        yerr = []
        for i in range(len(config['seconds_bucket'])):
            x.append(i)
            data = [x['time']/1000 for x in config['seconds_bucket'][i]]
            y.append(statistics.mean(data))
            yerr.append(statistics.stdev(data) if len(data) > 1 else 0)

        data_chart.append({
            'x': x,'y': y,'yerr': yerr,'label': f"{config['client']} clients",
        })

    plot(data=data_chart, title=f'Mean transaction latency for {qtype} SELECT query', xlabel='Test time [s]', ylabel='Latency [ms]', output_name=f'select_{qtype}_latency')

def qtype_rate_plot(configurations, qtype):
    data_chart = []
    for config in configurations:
        x = []
        y = []
        for i in range(math.ceil(len(config['seconds_bucket'])/5)):
            x.append(i*5)
            data = config['seconds_bucket'][i: i+5]
            y.append(sum([len(x) for x in data])/5)

        data_chart.append({
            'x': x,'y': y,'label': f"{config['client']} clients",
        })

    plot(data=data_chart, title=f'Number of transactions per second for {qtype} SELECT query', xlabel='Test time [s]', ylabel='Number of transactions', output_name=f'select_{qtype}_transaction')


def analyze_queries():
    for qtype in ['bmp_state', 'count', 'distinct']:
        base_qtype = join(base, 'tests', qtype)
        configurations = []

        for client in clients:
            test_folder = join(base_qtype, f'clients_{client}')
            stdout = join(test_folder, 'stdout.txt')
            with open(stdout, 'r') as fp:
                if 'the above results are incomplete.' in fp.read():
                    print('test', test_folder, 'is not valid (incomplete)')
                    continue
            log_file = join(test_folder, 'pgbench_log.1')
            parsed = parse_log(log_file)
            parsed = log_time_fix(parsed)
            seconds = log_bucket(parsed)
            configurations.append({
                'client': client,
                'seconds_bucket': seconds,
                'parsed': parsed
            })

        qtype_latency_plot(configurations, qtype)
        qtype_rate_plot(configurations, qtype)


analyze_inserts()
analyze_queries()