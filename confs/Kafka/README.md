# Kafka

Download the latest version of Kafka: https://kafka.apache.org/downloads. If Kafka is running on the same machine as Druid, the same Zookeeper instance can be used (which is started alongside the single-server deployment).

It makes sense to use separate topics for individual BMP message types. However, pmacct produces to one BMP topic. To split the topics, use something like the following for the route monitoring example:

```bash
bin/kafka-console-consumer.sh --bootstrap-server $KAFKA_IP:$KAFKA_PORT --topic $GENERAL_BMP | grep '\"bmp_msg_type\": \"route_monitor\"' | bin/kafka-console-producer.sh --bootstrap-server $KAFKA_IP:$KAFKA_PORT --topic $ROUTE_MONITOR_TOPIC
```
