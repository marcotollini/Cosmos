# important integer_not_func

https://docs.timescale.com/latest/api#set_integer_now_func
```
CREATE OR REPLACE FUNCTION unix_now() returns INTEGER LANGUAGE SQL STABLE as $$ SELECT extract(epoch from now())::INTEGER $$;

SELECT set_integer_now_func('event', 'unix_now');
SELECT set_integer_now_func('dump', 'unix_now');
```

# Baseline size
```
CREATE OR REPLACE FUNCTION unix_now() returns BIGINT LANGUAGE SQL STABLE as $$ SELECT extract(epoch from now())::BIGINT $$;

SELECT set_integer_now_func('test_table_bigint', 'unix_now');
```

1 billion rows, half dump, half events occupies 300GB without compression.

```
SELECT * FROM chunks_detailed_size('event')
"chunk_schema"	"chunk_name"	"table_bytes"	"index_bytes"	"toast_bytes"	"total_bytes"	"node_name"
"_timescaledb_internal"	"_hyper_1_1_chunk"	136951144448	13467844608	8192	150418997248
```

# retention policy
```
SELECT add_retention_policy('event', 7*24*60*60);
SELECT add_retention_policy('dump', 7*24*60*60);
```
