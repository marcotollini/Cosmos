# Benchmark

## Batch job

We want to group the data of the last x minutes to be able to update the current state of the network. While the operation is done for every event type, stats is by far the biggest, with a possible load of up to thousands of events per second. Therefore, we focus on this event type.

The base query is as follows:

```sql
EXPLAIN ANALYZE SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi) *
FROM event_stats
WHERE timestamp_arrival > 1610675637 AND timestamp_arrival < 1610689637
ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi, timestamp_arrival DESC;
```

Between that time interval, there are about 5M rows: 5'133'686

https://explain.depesz.com/s/PmVY
```
exec not indexes (but timestamp)
 Unique  (cost=1205902.98..1384227.52 rows=5486909 width=196) (actual time=42954.688..63984.569 rows=3363 loops=1)
   ->  Sort  (cost=1205902.98..1219620.25 rows=5486909 width=196) (actual time=42954.686..62078.415 rows=5133686 loops=1)
         Sort Key: _hyper_6_11_chunk.bmp_router, _hyper_6_11_chunk.peer_ip, _hyper_6_11_chunk.peer_asn, _hyper_6_11_chunk.peer_type, _hyper_6_11_chunk.is_in, _hyper_6_11_chunk.is_filtered, _hyper_6_11_chunk.is_loc, _hyper_6_11_chunk.is_post, _hyper_6_11_chunk.is_out, _hyper_6_11_chunk.rd, _hyper_6_11_chunk.afi, _hyper_6_11_chunk.safi, _hyper_6_11_chunk.timestamp_arrival DESC
         Sort Method: external merge  Disk: 1077024kB
         ->  Index Scan using _hyper_6_11_chunk_event_stats_timestamp_arrival_idx on _hyper_6_11_chunk  (cost=0.56..284142.74 rows=5486909 width=196) (actual time=0.032..1289.088 rows=5133686 loops=1)
               Index Cond: ((timestamp_arrival > 1610675637) AND (timestamp_arrival < 1610689637))
 Planning Time: 0.478 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 1.520 ms, Inlining 18.650 ms, Optimization 81.101 ms, Emission 59.651 ms, Total 160.922 ms
 Execution Time: 64092.804 ms
```

The table has no index, but the default timescaledb index on the timestamp_arrival.



### Indexing

`distinct on` requires a sort. Thus, we create an index on every column we use to sort:

```sql
CREATE INDEX ON event_stats (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi, timestamp_arrival DESC);
```
It takes 1631.678 seconds to execute on 300+M rows

https://explain.depesz.com/s/2vrw
```
 Unique  (cost=1205902.98..1384227.52 rows=5486909 width=196) (actual time=43066.692..64152.922 rows=3363 loops=1)
   ->  Sort  (cost=1205902.98..1219620.25 rows=5486909 width=196) (actual time=43066.690..62126.544 rows=5133686 loops=1)
         Sort Key: _hyper_6_11_chunk.bmp_router, _hyper_6_11_chunk.peer_ip, _hyper_6_11_chunk.peer_asn, _hyper_6_11_chunk.peer_type, _hyper_6_11_chunk.is_in, _hyper_6_11_chunk.is_filtered, _hyper_6_11_chunk.is_loc, _hyper_6_11_chunk.is_post, _hyper_6_11_chunk.is_out, _hyper_6_11_chunk.rd, _hyper_6_11_chunk.afi, _hyper_6_11_chunk.safi, _hyper_6_11_chunk.timestamp_arrival DESC
         Sort Method: external merge  Disk: 1077024kB
         ->  Index Scan using _hyper_6_11_chunk_event_stats_timestamp_arrival_idx on _hyper_6_11_chunk  (cost=0.56..284142.74 rows=5486909 width=196) (actual time=0.060..1486.426 rows=5133686 loops=1)
               Index Cond: ((timestamp_arrival > 1610675637) AND (timestamp_arrival < 1610689637))
 Planning Time: 0.439 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 1.712 ms, Inlining 147.999 ms, Optimization 78.860 ms, Emission 60.728 ms, Total 289.299 ms
 Execution Time: 64351.182 ms
```

As we can see, even with indexing, the optimizer still wants to sort the data, which is by far the most costly operaton. Also, we notice
that the sorti method is external merge disk, since the data can't fit in the worker memory

### Worker memory

Worker memory in our configuration has only 20MB of space, which can't fit 1'077'024kB of data, thus we increase the disk space to 4g

```sql
SET work_mem = '4096MB';
SHOW work_mem;
EXPLAIN ANALYZE SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi) *
FROM event_stats
WHERE timestamp_arrival > 1610675637 AND timestamp_arrival < 1610689637
ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi, timestamp_arrival DESC;
RESET work_mem;
```


https://explain.depesz.com/s/dp1z
```
 Unique  (cost=898335.33..1076659.87 rows=5486909 width=196) (actual time=90978.797..93476.597 rows=3363 loops=1)
   ->  Sort  (cost=898335.33..912052.60 rows=5486909 width=196) (actual time=90978.795..91486.317 rows=5133686 loops=1)
         Sort Key: _hyper_6_11_chunk.bmp_router, _hyper_6_11_chunk.peer_ip, _hyper_6_11_chunk.peer_asn, _hyper_6_11_chunk.peer_type, _hyper_6_11_chunk.is_in, _hyper_6_11_chunk.is_filtered, _hyper_6_11_chunk.is_loc, _hyper_6_11_chunk.is_post, _hyper_6_11_chunk.is_out, _hyper_6_11_chunk.rd, _hyper_6_11_chunk.afi, _hyper_6_11_chunk.safi, _hyper_6_11_chunk.timestamp_arrival DESC
         Sort Method: quicksort  Memory: 1560244kB
         ->  Index Scan using _hyper_6_11_chunk_event_stats_timestamp_arrival_idx on _hyper_6_11_chunk  (cost=0.56..284142.74 rows=5486909 width=196) (actual time=0.045..1270.074 rows=5133686 loops=1)
               Index Cond: ((timestamp_arrival > 1610675637) AND (timestamp_arrival < 1610689637))
 Planning Time: 0.711 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 2.911 ms, Inlining 18.559 ms, Optimization 79.553 ms, Emission 59.008 ms, Total 160.031 ms
 Execution Time: 93576.369 ms
```

We can see that the memory is creased since the new sorting method is quicksort. However, we still sort, and the total time almost doubled. Bad.

### Optimise table

We didn't optimised the table for a while. Therefore, we tried with indeces + optimizations:

https://explain.depesz.com/s/rXpV
```
 Unique  (cost=1205902.98..1384227.52 rows=5486909 width=196) (actual time=42899.013..63924.133 rows=3363 loops=1)
   ->  Sort  (cost=1205902.98..1219620.25 rows=5486909 width=196) (actual time=42899.011..62015.122 rows=5133686 loops=1)
         Sort Key: _hyper_6_11_chunk.bmp_router, _hyper_6_11_chunk.peer_ip, _hyper_6_11_chunk.peer_asn, _hyper_6_11_chunk.peer_type, _hyper_6_11_chunk.is_in, _hyper_6_11_chunk.is_filtered, _hyper_6_11_chunk.is_loc, _hyper_6_11_chunk.is_post, _hyper_6_11_chunk.is_out, _hyper_6_11_chunk.rd, _hyper_6_11_chunk.afi, _hyper_6_11_chunk.safi, _hyper_6_11_chunk.timestamp_arrival DESC
         Sort Method: external merge  Disk: 1077024kB
         ->  Index Scan using _hyper_6_11_chunk_event_stats_timestamp_arrival_idx on _hyper_6_11_chunk  (cost=0.56..284142.74 rows=5486909 width=196) (actual time=0.044..1296.879 rows=5133686 loops=1)
               Index Cond: ((timestamp_arrival > 1610675637) AND (timestamp_arrival < 1610689637))
 Planning Time: 0.611 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 14.222 ms, Inlining 18.754 ms, Optimization 79.255 ms, Emission 59.005 ms, Total 171.235 ms
 Execution Time: 64038.649 ms
```

Again, we keep the time stable at 64 seconds.


### Disable sorting - trust me, I know what I am doing

Since we have the indces, we should be able to actually skip the sorting, and using the index instead.

```sql
SET enable_sort = off;
SHOW enable_sort;
EXPLAIN ANALYZE SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi) *
FROM event_stats
WHERE timestamp_arrival > 1610675637 AND timestamp_arrival < 1610689637
ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, afi, safi, timestamp_arrival DESC;
RESET enable_sort;
```

https://explain.depesz.com/s/ZyjQ
```
 Unique  (cost=0.69..1932626.83 rows=5486909 width=196) (actual time=0.135..9548.132 rows=3363 loops=1)
   ->  Index Scan using _hyper_6_11_chunk_event_stats_bmp_router_peer_ip_peer_asn_peer_ on _hyper_6_11_chunk  (cost=0.69..1768019.56 rows=5486909 width=196) (actual time=0.134..7398.083 rows=5133686 loops=1)
         Index Cond: ((timestamp_arrival > 1610675637) AND (timestamp_arrival < 1610689637))
 Planning Time: 0.531 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 1.922 ms, Inlining 20.211 ms, Optimization 82.473 ms, Emission 61.581 ms, Total 166.187 ms
 Execution Time: 9550.601 ms
```

Indeed the time went from 64 seconds down to 9.5 seconds. Not too bad.

We also tried with approximately 10M rows and the execution time was 18 seconds, showing that the growth is linear and not exponential. Great!


## Insertion test

```
\copy (SELECT * FROM event_stats where timestamp_arrival > 1610675637 and timestamp_arrival < 1610689637) to '/event_stats.csv' with csv
pg_dump -U l3visualization  l3visualization -t event_stats --schema-only > /event_stats.sql
```
We export the same 5M rows as before, and the schema of the table, which does not contain any index, but the default one created by timescaledb on timestamp_arrival.

```sh
docker run --rm -v /home/taatomae/BMP-IPFIX-Visualization/benchmark/event_stats.csv:/event_stats.csv -it golang bash
go get github.com/timescale/benchmark-postgres
cd $GOPATH/src/github.com/timescale/benchmark-postgres/cmd/timescaledb-parallel-copy
go get .
go install
```

### Single worker, 5k rows insert

```sh
timescaledb-parallel-copy --connection "host=10.212.226.67 port=8098 user=l3visualization_test password=postgres_password sslmode=disable" --db-name=l3visualization_test --table=event_stats --verbose --reporting-period=30s --file=/event_stats.csv --copy-options="NULL ''"
5000 rows at once by default

at 30s, row rate 96666.134336/sec (period), row rate 96666.134336/sec (overall), 2.900000E+06 total rows
COPY 5133686, took 52.56960664s with 1 worker(s) (mean rate 97655.020232/sec)
```

### Single worker, 200 rows insert
```sh
timescaledb-parallel-copy --connection "host=10.212.226.67 port=8098 user=l3visualization_test password=postgres_password sslmode=disable" --db-name=l3visualization_test --table=event_stats --verbose --reporting-period=10s --file=/event_stats.csv --copy-options="NULL ''" --batch-size=200

at 10s, row rate 61499.561797/sec (period), row rate 61499.561797/sec (overall), 6.150000E+05 total rows
at 20s, row rate 60180.349353/sec (period), row rate 60839.959840/sec (overall), 1.216800E+06 total rows
at 30s, row rate 57819.843123/sec (period), row rate 59833.252890/sec (overall), 1.795000E+06 total rows
at 40s, row rate 61479.826018/sec (period), row rate 60244.896630/sec (overall), 2.409800E+06 total rows
at 50s, row rate 57999.955253/sec (period), row rate 59795.908694/sec (overall), 2.989800E+06 total rows
at 1m0s, row rate 63300.219088/sec (period), row rate 60379.957999/sec (overall), 3.622800E+06 total rows
at 1m10s, row rate 60999.819349/sec (period), row rate 60468.509792/sec (overall), 4.232800E+06 total rows
at 1m20s, row rate 59479.191963/sec (period), row rate 60344.843704/sec (overall), 4.827600E+06 total rows
COPY 5133686, took 1m24.752041761s with 1 worker(s) (mean rate 60573.006778/sec)
```

### 4 workers, 200 rows insert
```sh
timescaledb-parallel-copy --connection "host=10.212.226.67 port=8098 user=l3visualization_test password=postgres_password sslmode=disable" --db-name=l3visualization_test --table=event_stats --verbose --reporting-period=10s --file=/event_stats.csv --copy-options="NULL ''" --batch-size=200 --workers 4

at 10s, row rate 164139.356557/sec (period), row rate 164139.356557/sec (overall), 1.641400E+06 total rows
at 20s, row rate 151007.716292/sec (period), row rate 157573.282257/sec (overall), 3.151600E+06 total rows
at 30s, row rate 131530.225554/sec (period), row rate 148892.960009/sec (overall), 4.466800E+06 total rows
COPY 5133686, took 34.29301458s with 4 worker(s) (mean rate 149700.633289/sec)
```

### 8 workers, 200 rows insert
```sh
timescaledb-parallel-copy --connection "host=10.212.226.67 port=8098 user=l3visualization_test password=postgres_password sslmode=disable" --db-name=l3visualization_test --table=event_stats --verbose --reporting-period=10s --file=/event_stats.csv --copy-options="NULL ''" --batch-size=200 --workers 8

at 10s, row rate 159918.786152/sec (period), row rate 159918.786152/sec (overall), 1.599200E+06 total rows
at 20s, row rate 160159.850987/sec (period), row rate 160039.318168/sec (overall), 3.200800E+06 total rows
at 30s, row rate 167100.150089/sec (period), row rate 162392.920715/sec (overall), 4.871800E+06 total rows
COPY 5133686, took 31.767596812s with 8 worker(s) (mean rate 161601.333282/sec)
```