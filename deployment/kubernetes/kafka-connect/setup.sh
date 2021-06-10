# 0000-00-00T00:00:00.000000Z
curl -X POST \
  -H "Content-Type: application/json" \
  --data @/connect/bmp_event.json \
  http://af9c0fb90637c4f6d804f72881877ec1-ba7046eca461d734.elb.eu-central-1.amazonaws.com/connectors

curl -X POST \
  -H "Content-Type: application/json" \
  --data @/connect/bmp_dump.json \
  http://af9c0fb90637c4f6d804f72881877ec1-ba7046eca461d734.elb.eu-central-1.amazonaws.com/connectors
