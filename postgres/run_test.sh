docker exec timescale_test bash -c 'psql --user "$POSTGRES_USER" -d "$POSTGRES_DB" -Xf /test/*.sql'
