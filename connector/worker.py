from helper.kafka import get_avro_consumer, get_next_msg
from helper.postgres import get_sql_connection, push_msg

from events.dispatcher import dispatch
from config import config
import multiprocessing
import traceback


class WorkerProcess(multiprocessing.Process):
    def __init__(self, thread_id):
        super().__init__()
        self.thread_id = thread_id
        self.__exit = multiprocessing.Event()

    def run(self):
        self.avro_client = get_avro_consumer()
        self.avro_client.subscribe(['nfacctd_bmp'])
        self.postgres_conn, self.postgres_cursor = get_sql_connection()

        while not self.__exit.is_set():
            # msg.headers(), msg.offset(), msg.partition(), msg.timestamp(), msg.topic(), msg.value()
            msg = get_next_msg(self.avro_client)

            if msg is None:
                continue

            try:
                table, msg_insert = dispatch(msg)

                push_msg(self.postgres_conn, self.postgres_cursor, msg_insert, table)

            except:
                print(msg.value())
                traceback.print_exc()

                return
                continue



        print('Kafka thread exiting...')

    def shutdown(self):
        print(f"Kafka worker: Shutdown initiated on id: {self.thread_id}")
        self.__exit.set()
        self.avro_client.close()


class WorkerSwarm:
    def __init__(self, number_of_workers):
        self.__processes = []
        for i in range(0, number_of_workers):
            t = WorkerProcess(i)
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


class Workers:
    def __init__(self):
        self.ws = WorkerSwarm(int(config['others']['processpool']))
        self.ws.start()

    def stop(self):
        self.ws.stop()
        self.ws.wait()
