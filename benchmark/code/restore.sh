# Backup ETH
pg_dump -U l3visualization -s -d l3visualization --table dump -N _timescaledb_internal |   grep -v _timescaledb_internal > dump_schema.sql
psql -d l3visualization -U l3visualization -c "\COPY (SELECT * FROM dump LIMIT 1500000) TO stdout DELIMITER ',' CSV" | gzip > dump_data.csv.gz

pg_dump -U l3visualization -s -d l3visualization --table event -N _timescaledb_internal |   grep -v _timescaledb_internal > event_schema.sql
psql -d l3visualization -U l3visualization -c "\COPY (SELECT * FROM event LIMIT 1500000) TO stdout DELIMITER ',' CSV" | gzip > event_data.csv.gz

docker cp timescale:/dump_schema.sql .
docker cp timescale:/dump_data.csv.gz .
docker cp timescale:/event_schema.sql .
docker cp timescale:/event_data.csv.gz .
#Copy from eth to terra
# CHANGE SCHEMA OWNER

# restore
docker run -it -v /home/taatomae/BMP-IPFIX-Visualization/datasets/:/datasets --rm postgres:12 bash
export PGPASSWORD=postgres
psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres
CREATE DATABASE l3visualization;
\c l3visualization
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS timescaledb;
exit

cd datasets

psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres -d l3visualization < dump_schema.sql
psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres -d l3visualization < event_schema.sql

psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres
\c l3visualization
SELECT create_hypertable('event', 'timestamp_arrival', chunk_time_interval => 24*60*60);
SELECT create_hypertable('dump', 'timestamp', chunk_time_interval => 24*60*60);

CREATE OR REPLACE FUNCTION unix_now() returns INTEGER LANGUAGE SQL STABLE as $$ SELECT extract(epoch from now())::INTEGER $$;
SELECT set_integer_now_func('event', 'unix_now');
SELECT set_integer_now_func('dump', 'unix_now');

SELECT add_retention_policy('event', 7*24*60*60);
SELECT add_retention_policy('dump', 7*24*60*60);
exit

gunzip < dump_data.csv.gz | psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres -d l3visualization -c "\COPY dump FROM stdin CSV"
gunzip < event_data.csv.gz | psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres -d l3visualization -c "\COPY event FROM stdin CSV"



############ RESTORE TEST PREP
docker run -it -v /home/taatomae/BMP-IPFIX-Visualization/datasets/:/datasets --rm postgres:12 bash
export PGPASSWORD=postgres
psql -h a8b4e008d16864c209d39080df978873-1483097086.eu-central-1.elb.amazonaws.com -U postgres
# copy table_ietf.sql