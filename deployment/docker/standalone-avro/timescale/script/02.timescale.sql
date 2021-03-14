CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('event', 'timestamp_arrival', chunk_time_interval => 24*60*60*1000);
SELECT create_hypertable('dump', 'timestamp', chunk_time_interval => 24*60*60*1000);