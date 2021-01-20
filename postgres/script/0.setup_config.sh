CONFIGPATH=/var/lib/postgresql/data/postgresql.conf
timescaledb-tune --quiet --yes --dry-run >> $CONFIGPATH
