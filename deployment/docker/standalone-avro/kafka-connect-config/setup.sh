# 0000-00-00T00:00:00.000000Z
curl -X POST 'http://kafka-connect:28083/connectors' -H "Content-Type: application/json" --data '@/connect/bmp_event.json'
curl -X POST 'http://kafka-connect:28083/connectors' -H "Content-Type: application/json" --data '@/connect/bmp_dump.json'
