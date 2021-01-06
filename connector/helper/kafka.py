from confluent_kafka.avro import AvroConsumer
from confluent_kafka.avro.serializer import SerializerError

from config import config

def get_avro_consumer():
    return AvroConsumer({
        'bootstrap.servers': config['kafka']['bootstrap.servers'],
        'group.id': config['kafka']['group.id'],
        'schema.registry.url': config['kafka']['schema.registry.url'],
        'auto.offset.reset': config['kafka']['auto.offset.reset']
    })

def get_next_msg(avro_client):
    try:
        msg = avro_client.poll(1)
    except SerializerError as e:
        print("Message deserialization failed for {}: {}".format(msg, e))
        return

    if msg is None:
        return

    if msg.error():
        print("AvroConsumer error: {}".format(msg.error()))
        return

    return msg