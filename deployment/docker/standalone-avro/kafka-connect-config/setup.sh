# 0000-00-00T00:00:00.000000Z
curl -X POST \
  -H "Content-Type: application/json" \
  --data @/connect/bmp_event.json \
  http://kafka-connect:28083/connectors

curl -X POST \
  -H "Content-Type: application/json" \
  --data @/connect/bmp_dump.json \
  http://kafka-connect:28083/connectors
