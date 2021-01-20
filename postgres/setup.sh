docker-compose down
./build.sh
docker-compose up -d
sleep 5
docker exec timescale_test bash -c 'psql --user "$POSTGRES_USER" -d "$POSTGRES_DB" -f /pgtap/sql/pgtap.sql  > /dev/null 2>&1'
