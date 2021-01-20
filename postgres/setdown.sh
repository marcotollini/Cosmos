docker-compose down
docker exec timescale_test bash -c 'psql --user "$POSTGRES_USER" -d "$POSTGRES_DB" -f /pgtap/sql/uninstall_pgtap.sql > /dev/null 2>&1'
docker-compose down
