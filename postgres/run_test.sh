docker exec timescale_test bash -c 'chmod 755 /docker-entrypoint-initdb.d/3.setup_fn.sh && /docker-entrypoint-initdb.d/3.setup_fn.sh > /dev/null 2>&1'
docker exec timescale_test bash -c 'psql --user "$POSTGRES_USER" -d "$POSTGRES_DB" -Xf /test/peering.compute_snapshot_peering.sql'
# docker exec timescale_test bash -c 'for file in /test/*.sql; do echo -e "######### \033[0;33m executing ${file} \033[0m ########" && psql --user "$POSTGRES_USER" -d "$POSTGRES_DB" -Xf ${file}; done'
