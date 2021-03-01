# 0000-00-00T00:00:00.000000Z
# https://rmoff.net/2020/01/22/kafka-connect-and-schemas/
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-event5",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "value.converter": "org.apache.kafka.connect.json.JsonConverter",
    "value.converter.schemas.enable": "true",
    "key.converter": "org.apache.kafka.connect.json.JsonConverter",
    "key.converter.schemas.enable": "false",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://timescale:5432/l3visualization?user=l3visualization&password=password",
    "topics": "nfacctd_bmp-with-schema",
    "table.name.format": "event",
    "transforms": "timestamp0000,castfloattimestamp,castbool,tojson,castinttimestamp",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_event,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.castbool.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.castbool.spec": "is_in:boolean,is_filtered:boolean,is_loc:boolean,is_post:boolean,is_out:boolean",
    "transforms.tojson.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.ToJsonList$Value",
    "transforms.tojson.fields": "comms,ecomms,lcomms,as_path",
    "transforms.tojson.separator": "\\space",
    "transforms.castfloattimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.castfloattimestamp.spec": "timestamp:float64,timestamp_event:float64,timestamp_arrival:float64",
    "transforms.castinttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.castinttimestamp.spec": "timestamp:int32,timestamp_event:int32,timestamp_arrival:int32"
    }
  }' \
  http://kafka-connect:28083/connectors
