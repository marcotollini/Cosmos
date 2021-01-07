from config import config
from db_setup import db_setup
from puller.kafka import Puller
from pusher.postgres import Pusher
import multiprocessing
from time import sleep, time


def main():
    # initialize the database by creating db + tables
    db_setup()

    msg_queue = multiprocessing.SimpleQueue()
    statistics_queue = multiprocessing.SimpleQueue()
    puller = Puller(msg_queue, statistics_queue)
    pusher = Pusher(msg_queue, statistics_queue)

    statistic = 0
    t = time()
    while True:
        stat = statistics_queue.get()

        if stat[0] == 'produce':
            statistic += stat[1]
        elif stat[0] == 'consume':
            statistic -= stat[1]

        t2 = time()
        if t2 - t > 10:
            t = t2
            print('queue size', statistic)


if __name__ == "__main__":
    main()