 sed -i '$ d' /var/lib/postgresql/data/pg_hba.conf
echo "host    all       all   all   trust" >> /var/lib/postgresql/data/pg_hba.conf
pg_ctl reload

CONFIGPATH=/var/lib/postgresql/data/postgresql.conf
echo "max_prepared_transactions = 150" >> $CONFIGPATH
timescaledb-tune --quiet --yes --dry-run >> $CONFIGPATH
