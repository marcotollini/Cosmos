from confluent_kafka.avro import AvroConsumer
from confluent_kafka.avro.serializer import SerializerError

from events.dispatcher import dispatch
from config import config
import multiprocessing

def get_avro_consumer():
    return AvroConsumer({
        'bootstrap.servers': config['kafka']['bootstrap.servers'],
        'group.id': config['kafka']['group.id'],
        'schema.registry.url': config['kafka']['schema.registry.url'],
        'auto.offset.reset': config['kafka']['auto.offset.reset']
    })

class WorkerProcess(multiprocessing.Process):
    def __init__(self, thread_id, msg_queue, statistics_queue):
        super().__init__()
        self.thread_id = thread_id
        self.__exit = multiprocessing.Event()
        self.msg_queue = msg_queue

        self.processed = 0
        self.statistics_queue = statistics_queue

    def run(self):
        self.avro_client = get_avro_consumer()
        self.avro_client.subscribe(['nfacctd_bmp'])

        while not self.__exit.is_set():
            # msg.headers(), msg.offset(), msg.partition(), msg.timestamp(), msg.topic(), msg.value()
            msg = self.get_next_msg()

            if msg is None:
                continue

            self.msg_queue.put((msg.topic(), msg.value()))

            self.processed += 1
            if self.processed % 1000 == 0:
                self.statistics_queue.put(('produce', self.processed))
                self.processed = 0

        print('Kafka thread exiting...')


    def get_next_msg(self):
        try:
            msg = self.avro_client.poll(1)
        except SerializerError as e:
            print("Message deserialization failed for {}: {}".format(msg, e))
            return

        if msg is None:
            return

        if msg.error():
            print("AvroConsumer error: {}".format(msg.error()))
            return

        return msg

    def shutdown(self):
        print(f"Kafka worker: Shutdown initiated on id: {self.thread_id}")
        self.__exit.set()
        self.avro_client.close()


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


class Puller:
    def __init__(self, msg_queue, statistics_queue):
        self.ws = WorkerSwarm(int(config['kafka']['processpool']), msg_queue, statistics_queue)
        self.ws.start()

    def stop(self):
        self.ws.stop()
        self.ws.wait()
