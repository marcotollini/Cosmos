CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('event_init', 'timestamp_arrival', chunk_time_interval => 30*24*60*60);
SELECT create_hypertable('event_log_init', 'timestamp', chunk_time_interval => 30*24*60*60);
SELECT create_hypertable('event_peer_down', 'timestamp_arrival', chunk_time_interval => 7*24*60*60);
SELECT create_hypertable('event_peer_up', 'timestamp_arrival', chunk_time_interval => 7*24*60*60);
SELECT create_hypertable('event_route_monitor', 'timestamp_arrival', chunk_time_interval => 1*24*60*60);
SELECT create_hypertable('event_stats', 'timestamp_arrival', chunk_time_interval => 1*24*60*60);
SELECT create_hypertable('event_log_close', 'timestamp', chunk_time_interval => 30*24*60*60);
SELECT create_hypertable('event_term', 'timestamp_arrival', chunk_time_interval => 30*24*60*60);
