# 0000-00-00T00:00:00.000000Z

curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-init",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_init",
    "transforms": "filtermsg,timestamp0000,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log\" && @.bmp_msg_type == \"init\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_event,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64,timestamp_event:float64,timestamp_arrival:float64"
    }
  }' \
  http://kafka-connect:28083/connectors


curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-log_init",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_log_init",
    "transforms": "filtermsg,timestamp0000,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log_init\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64"
    }
  }' \
  http://kafka-connect:28083/connectors

curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-peer_down",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_peer_down",
    "transforms": "filtermsg,timestamp0000,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log\" && @.bmp_msg_type == \"peer_down\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_event,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64,timestamp_event:float64,timestamp_arrival:float64"
    }
  }' \
  http://kafka-connect:28083/connectors

curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-peer_up",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_peer_up",
    "transforms": "filtermsg,timestamp0000,castbool,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log\" && @.bmp_msg_type == \"peer_up\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_event,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.castbool.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.castbool.spec": "is_in:boolean,is_filtered:boolean,is_loc:boolean,is_post:boolean,is_out:boolean",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64,timestamp_event:float64,timestamp_arrival:float64"
    }
  }' \
  http://kafka-connect:28083/connectors


curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-route_monitor",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_route_monitor",
    "transforms": "filtermsg,timestamp0000,castbool,tojson,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log\" && @.bmp_msg_type == \"route_monitor\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.castbool.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.castbool.spec": "is_in:boolean,is_filtered:boolean,is_loc:boolean,is_post:boolean,is_out:boolean",
    "transforms.tojson.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.ToJsonList$Value",
    "transforms.tojson.fields": "comms,ecomms,lcomms,as_path",
    "transforms.tojson.separator": "\\space",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64,timestamp_arrival:float64"
    }
  }' \
  http://kafka-connect:28083/connectors


curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-stats",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_stats",
    "transforms": "filtermsg,timestamp0000,castbool,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log\" && @.bmp_msg_type == \"stats\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.castbool.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.castbool.spec": "is_in:boolean,is_filtered:boolean,is_loc:boolean,is_post:boolean,is_out:boolean",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64,timestamp_arrival:float64"
    }
  }' \
  http://kafka-connect:28083/connectors


curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-log_close",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_log_close",
    "transforms": "filtermsg,timestamp0000,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log_close\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64"
    }
  }' \
  http://kafka-connect:28083/connectors

curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "name": "jdbc-term",
  "config": {
    "connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
    "tasks.max": 1,
    "connection.url": "jdbc:postgresql://postgres:5432/l3visualization?user=l3visualization&password=postgres_password",
    "topics": "nfacctd_bmp",
    "table.name.format": "event_term",
    "transforms": "filtermsg,timestamp0000,casttimestamp",
    "transforms.filtermsg.type": "io.confluent.connect.transforms.Filter$Value",
    "transforms.filtermsg.filter.condition": "$[?(@.event_type == \"log\" && @.bmp_msg_type == \"term\")]",
    "transforms.filtermsg.filter.type": "include",
    "transforms.timestamp0000.type": "com.github.marcotollini.kafka.connect.nfacctd.smt.RegexNullify$Value",
    "transforms.timestamp0000.fields": "timestamp,timestamp_event,timestamp_arrival",
    "transforms.timestamp0000.regex": "0.000000",
    "transforms.casttimestamp.type": "org.apache.kafka.connect.transforms.Cast$Value",
    "transforms.casttimestamp.spec": "timestamp:float64,timestamp_event:float64,timestamp_arrival:float64"
    }
  }' \
  http://kafka-connect:28083/connectors