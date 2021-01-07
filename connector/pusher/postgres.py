from events.dispatcher import dispatch
import multiprocessing
from config import config
import psycopg2
from pypika import Query, Table, Field
import threading
from time import sleep

def get_sql_connection():
    connection = psycopg2.connect(dbname=config['postgresql']['dbname'], user=config['postgresql']['user'], password=config['postgresql']['password'], host=config['postgresql']['host'], port=config['postgresql']['port'])
    cursor = connection.cursor()
    return connection, cursor

class WorkerProcess(multiprocessing.Process):
    def __init__(self, thread_id, msg_queue, statistics_queue):
        super().__init__()
        self.thread_id = thread_id
        self.msg_queue = msg_queue

        self.statistics_queue = statistics_queue
        self.processed = 0

        self.connection = None


    def run(self):
        self.connection, self.cursor = get_sql_connection()
        while True:
            msg_tuple = self.msg_queue.get()

            if msg_tuple is None:
                return

            (msg_topic, msg_value) = msg_tuple

            table, msg_mod = dispatch(msg_topic, msg_value)

            self.push_msg(msg_mod, table)

            self.processed += 1
            if self.processed % 1000 == 0:
                self.statistics_queue.put(('consume', self.processed))
                self.processed = 0

        print('Postgres thread exiting...')


    def push_msg(self, row, table):
        table = Table(table)
        q = Query.into(table).columns(*row.keys()).insert(*row.values())
        self.cursor.execute(str(q))
        self.connection.commit()

    def shutdown(self):
        print(f"Kafka worker: Shutdown initiated on id: {self.thread_id}")



class WorkerSwarm:
    def __init__(self, number_of_workers, msg_queue, statistics_queue):
        self.__processes = []
        for i in range(0, number_of_workers):
            t = WorkerProcess(i, msg_queue, statistics_queue)
            self.__processes.append(t)

    def start(self):
        for process in self.__processes:
            process.start()

    def wait(self):
        for process in self.__processes:
            process.join()

    def stop(self):
        for process in self.__processes:
            process.shutdown()


class Pusher:
    def __init__(self, msg_queue, statistics_queue):
        self.ws = WorkerSwarm(int(config['postgresql']['processpool']), msg_queue, statistics_queue)
        self.ws.start()

    def stop(self):
        self.ws.stop()
        self.ws.wait()
