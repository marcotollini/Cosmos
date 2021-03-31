CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('event', 'timestamp_arrival', chunk_time_interval => 24*60*60);
SELECT create_hypertable('dump', 'timestamp', chunk_time_interval => 24*60*60);

CREATE OR REPLACE FUNCTION unix_now() returns INTEGER LANGUAGE SQL STABLE as $$ SELECT extract(epoch from now())::INTEGER $$;
SELECT set_integer_now_func('event', 'unix_now');
SELECT set_integer_now_func('dump', 'unix_now');

SELECT add_retention_policy('event', 7*24*60*60);
SELECT add_retention_policy('dump', 7*24*60*60);
