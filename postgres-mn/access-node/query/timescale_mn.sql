CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT add_data_node('eth', host => '10.212.226.67', port=> 8099);
SELECT add_data_node('terra231', host => '10.110.110.231', port=> 8099);
SELECT add_data_node('sbd1', host => '10.212.226.86', port=> 8099);
SELECT add_data_node('sbd2', host => '10.212.226.87', port=> 8099);
