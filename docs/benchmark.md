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

## Selection

```sql
SELECT *
FROM snapshot_peer_up
WHERE id_peer_up_info = 0;
```

https://explain.depesz.com/s/yZru
```
 Gather  (cost=1000.00..41324.47 rows=1 width=154) (actual time=91.669..103.896 rows=0 loops=1)
   Workers Planned: 4
   Workers Launched: 4
   ->  Parallel Seq Scan on snapshot_peer_up  (cost=0.00..40324.38 rows=1 width=154) (actual time=56.465..56.466 rows=0 loops=5)
         Filter: (id_peer_up_info = 0)
         Rows Removed by Filter: 413328
 Planning Time: 0.207 ms
 Execution Time: 103.940 ms
(8 rows)
```

After index

```sql
CREATE INDEX ON snapshot_peer_up(id_peer_up_info);
```

https://explain.depesz.com/s/Kji9
```
Index Scan using snapshot_peer_up_id_peer_up_info_idx on snapshot_peer_up  (cost=0.43..1.55 rows=1 width=154) (actual time=0.042..0.043 rows=0 loops=1)
   Index Cond: (id_peer_up_info = 0)
 Planning Time: 0.246 ms
 Execution Time: 0.062 ms
```

## Distinct

```sql
SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
FROM event_peer_up
WHERE id_peer_up <= 100000 AND id_peer_up > 0
ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC;
```

https://explain.depesz.com/s/4YyX
```
 Unique  (cost=441679.35..445175.44 rows=107572 width=146) (actual time=942.076..1009.749 rows=99003 loops=1)
   ->  Sort  (cost=441679.35..441948.28 rows=107572 width=146) (actual time=942.073..955.886 rows=100000 loops=1)
         Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
         Sort Method: quicksort  Memory: 16996kB
         ->  Gather  (cost=1000.00..432689.05 rows=107572 width=146) (actual time=10.004..647.871 rows=100000 loops=1)
               Workers Planned: 4
               Workers Launched: 4
               ->  Parallel Seq Scan on _hyper_4_1_chunk  (cost=0.00..420931.85 rows=26893 width=146) (actual time=5.451..613.901 rows=20000 loops=5)
                     Filter: ((id_peer_up <= 100000) AND (id_peer_up > 0))
                     Rows Removed by Filter: 4380000
 Planning Time: 0.412 ms
 JIT:
   Functions: 11
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 4.195 ms, Inlining 0.000 ms, Optimization 2.252 ms, Emission 24.204 ms, Total 30.650 ms
 Execution Time: 1015.838 ms
 ```

 Index
```sql
CREATE INDEX ON event_peer_up(bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC);
```

Still sorting:
https://explain.depesz.com/s/mUZm
```
Unique  (cost=441679.50..445175.59 rows=107572 width=146) (actual time=905.523..971.025 rows=99003 loops=1)
   ->  Sort  (cost=441679.50..441948.43 rows=107572 width=146) (actual time=905.520..917.992 rows=100000 loops=1)
         Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
         Sort Method: quicksort  Memory: 16996kB
         ->  Gather  (cost=1000.00..432689.20 rows=107572 width=146) (actual time=9.218..619.037 rows=100000 loops=1)
               Workers Planned: 4
               Workers Launched: 4
               ->  Parallel Seq Scan on _hyper_4_1_chunk  (cost=0.00..420932.00 rows=26893 width=146) (actual time=5.270..585.826 rows=20000 loops=5)
                     Filter: ((id_peer_up <= 100000) AND (id_peer_up > 0))
                     Rows Removed by Filter: 4380000
 Planning Time: 0.574 ms
 JIT:
   Functions: 11
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 4.561 ms, Inlining 0.000 ms, Optimization 1.723 ms, Emission 23.844 ms, Total 30.128 ms
 Execution Time: 977.522 ms
 ```

By disabling sort
 ```sql
 BEGIN;
 SET LOCAL enable_sort = off;

 SHOW enable_sort;
 SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
  FROM event_peer_up
  WHERE id_peer_up <= 100000 AND id_peer_up > 0
  ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC;
COMMIT;
```

```
Unique  (cost=1000.62..782483.31 rows=107572 width=146) (actual time=164.970..6228.247 rows=99003 loops=1)
   ->  Gather Merge  (cost=1000.62..779256.15 rows=107572 width=146) (actual time=164.969..6166.430 rows=100000 loops=1)
         Workers Planned: 4
         Workers Launched: 4
         ->  Parallel Index Scan using _hyper_4_1_chunk_event_peer_up_bmp_router_peer_ip_peer_asn_peer on _hyper_4_1_chunk  (cost=0.56..765443.23 rows=26893 width=146) (actual time=122.403..5205.625 rows=20000 loops=5)
               Filter: ((id_peer_up <= 100000) AND (id_peer_up > 0))
               Rows Removed by Filter: 4380000
 Planning Time: 0.389 ms
 JIT:
   Functions: 11
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 4.051 ms, Inlining 381.631 ms, Optimization 132.169 ms, Emission 88.180 ms, Total 606.031 ms
 Execution Time: 6235.465 ms
```

Increase the following values (https://dba.stackexchange.com/questions/242918/query-performance-of-index-scans-slower-than-parallel-seq-scan-on-postgres):

  **max_parallel_workers_per_gather**: limits how many workers can be used. You must have set this to 4 or more.
  **min_parallel_table_scan_size**: if a table is bigger than that, a parallel worker is planned. If the table size exceeds 3n-1 times that value, n parallel workers are planned. So either your table is very big, or you reduced the parameter. Alternatively:
  The storage parameter **parallel_workers** on the table overrides the calculation based on **min_parallel_table_scan_size** as described above, so maybe you set that.
  Finally, **min_parallel_index_scan_size** governs when a parallel index scan is considered. Either the index is small, or you lowered the parameter


With `SET LOCAL max_parallel_workers_per_gather = 8;`:


``` Unique  (cost=1000.66..755244.44 rows=107572 width=146) (actual time=176.991..4612.051 rows=99003 loops=1)
   ->  Gather Merge  (cost=1000.66..752017.28 rows=107572 width=146) (actual time=176.989..4547.625 rows=100000 loops=1)
         Workers Planned: 6
         Workers Launched: 6
         ->  Parallel Index Scan using _hyper_4_1_chunk_event_peer_up_bmp_router_peer_ip_peer_asn_peer on _hyper_4_1_chunk  (cost=0.56..737943.23 rows=17929 width=146) (actual time=126.798..3970.864 rows=14286 loops=7)
               Filter: ((id_peer_up <= 100000) AND (id_peer_up > 0))
               Rows Removed by Filter: 3128571
 Planning Time: 0.419 ms
 JIT:
   Functions: 15
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 6.242 ms, Inlining 584.942 ms, Optimization 174.045 ms, Emission 109.112 ms, Total 874.341 ms
 Execution Time: 4620.217 ms
 ```


 What if the table is bigger? Let's try with 5M elements

Baseline:

```sql
CREATE INDEX ON event_peer_up(id_peer_up);
```

```
Unique  (cost=976160.63..1139891.21 rows=5037864 width=146) (actual time=16955.053..42858.405 rows=2660939 loops=1)
   ->  Sort  (cost=976160.63..988755.29 rows=5037864 width=146) (actual time=16955.052..40469.098 rows=5000000 loops=1)
         Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
         Sort Method: external merge  Disk: 518696kB
         ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..193452.22 rows=5037864 width=146) (actual time=0.037..1219.889 rows=5000000 loops=1)
               Index Cond: ((id_peer_up <= 5000000) AND (id_peer_up > 0))
 Planning Time: 0.726 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 1.553 ms, Inlining 18.628 ms, Optimization 70.444 ms, Emission 54.663 ms, Total 145.288 ms
 Execution Time: 43025.416 ms
 ```

with sort disabled:

```
Unique  (cost=0.56..1164065.95 rows=5037424 width=146) (actual time=143.105..26485.115 rows=2660939 loops=1)
   ->  Index Scan using _hyper_4_1_chunk_event_peer_up_bmp_router_peer_ip_peer_asn_peer on _hyper_4_1_chunk  (cost=0.56..1012943.23 rows=5037424 width=146) (actual time=143.102..23965.892 rows=5000000 loops=1)
         Filter: ((id_peer_up <= 5000000) AND (id_peer_up > 0))
         Rows Removed by Filter: 17000000
 Planning Time: 0.377 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 1.507 ms, Inlining 18.488 ms, Optimization 70.505 ms, Emission 53.891 ms, Total 144.391 ms
 Execution Time: 26591.775 ms

```

With more parallel workers (to 16):

```
 Unique  (cost=0.56..1164065.95 rows=5037424 width=146) (actual time=145.407..26500.076 rows=2660939 loops=1)
   ->  Index Scan using _hyper_4_1_chunk_event_peer_up_bmp_router_peer_ip_peer_asn_peer on _hyper_4_1_chunk  (cost=0.56..1012943.23 rows=5037424 width=146) (actual time=145.405..23975.247 rows=5000000 loops=1)
         Filter: ((id_peer_up <= 5000000) AND (id_peer_up > 0))
         Rows Removed by Filter: 17000000
 Planning Time: 0.388 ms
 JIT:
   Functions: 3
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 1.516 ms, Inlining 19.309 ms, Optimization 71.047 ms, Emission 54.848 ms, Total 146.720 ms
 Execution Time: 26608.544 ms
```

Does not take advantage of the index on id_peer_up, the planning is as before:
```sql
explain analyze WITH a AS (
  SELECT *
  FROM event_peer_up
  WHERE id_peer_up <= 5000000 AND id_peer_up > 0
)
SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
FROM a
ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC;
```

Complete:
```sql
explain analyze WITH
prev_status AS (
    SELECT *
    FROM snapshot_peer_up
    WHERE id_peer_up_info = 0
),
new_up_distinct AS (
    SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
    FROM event_peer_up
    WHERE id_peer_up <= 1000000 AND id_peer_up > 0
    ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
),
merged AS (
    SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM prev_status
    UNION ALL
    SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM new_up_distinct
),
merged_distinct AS (
    SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
    FROM merged
    ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
)
SELECT * from merged_distinct;
```

SOMEHOW, super fast. They know what they are doing.
```
 Unique  (cost=181820.60..264196.56 rows=998497 width=146) (actual time=3372.249..6388.539 rows=906585 loops=1)
   ->  Merge Append  (cost=181820.60..234241.65 rows=998497 width=146) (actual time=3372.248..5949.453 rows=906585 loops=1)
         Sort Key: snapshot_peer_up.bmp_router, snapshot_peer_up.peer_ip, snapshot_peer_up.peer_asn, snapshot_peer_up.peer_type, snapshot_peer_up.is_in, snapshot_peer_up.is_filtered, snapshot_peer_up.is_loc, snapshot_peer_up.is_post, snapshot_peer_up.is_out, snapshot_peer_up.rd, snapshot_peer_up.bgp_id, snapshot_peer_up.local_ip, snapshot_peer_up.timestamp_arrival DESC
         ->  Sort  (cost=1.57..1.57 rows=1 width=146) (actual time=0.021..0.022 rows=0 loops=1)
               Sort Key: snapshot_peer_up.bmp_router, snapshot_peer_up.peer_ip, snapshot_peer_up.peer_asn, snapshot_peer_up.peer_type, snapshot_peer_up.is_in, snapshot_peer_up.is_filtered, snapshot_peer_up.is_loc, snapshot_peer_up.is_post, snapshot_peer_up.is_out, snapshot_peer_up.rd, snapshot_peer_up.bgp_id, snapshot_peer_up.local_ip, snapshot_peer_up.timestamp_arrival DESC
               Sort Method: quicksort  Memory: 25kB
               ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx on snapshot_peer_up  (cost=0.43..1.55 rows=1 width=146) (actual time=0.012..0.012 rows=0 loops=1)
                     Index Cond: (id_peer_up_info = 0)
         ->  Unique  (cost=181819.02..214270.14 rows=998496 width=146) (actual time=3372.224..5867.614 rows=906585 loops=1)
               ->  Sort  (cost=181819.02..184315.26 rows=998496 width=146) (actual time=3372.223..5424.784 rows=1000000 loops=1)
                     Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                     Sort Method: external merge  Disk: 103736kB
                     ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..38343.26 rows=998496 width=146) (actual time=0.021..217.151 rows=1000000 loops=1)
                           Index Cond: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
 Planning Time: 1.064 ms
 JIT:
   Functions: 8
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 3.789 ms, Inlining 0.000 ms, Optimization 1.398 ms, Emission 22.947 ms, Total 28.134 ms
 Execution Time: 6438.989 ms
```


```sql
explain analyze WITH
prev_status AS (
    SELECT *
    FROM snapshot_peer_up
    WHERE id_peer_up_info = 0
),
new_up_distinct AS (
    SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
    FROM event_peer_up
    WHERE id_peer_up <= 1000000 AND id_peer_up > 0
    ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
),
merged AS (
    SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM prev_status
    UNION ALL
    SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM new_up_distinct
),
merged_distinct AS (
    SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
    FROM merged
    ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
)
INSERT INTO snapshot_peer_up(id_peer_up_info, id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database)
SELECT 4 AS id_peer_up_info, id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
FROM merged_distinct;
```

https://explain.depesz.com/s/WAbY
```
 Insert on snapshot_peer_up  (cost=181820.60..279174.02 rows=998497 width=154) (actual time=10390.576..10390.578 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=181820.60..279174.02 rows=998497 width=154) (actual time=3353.296..7389.715 rows=906585 loops=1)
         ->  Unique  (cost=181820.60..264196.57 rows=998497 width=146) (actual time=3318.200..6470.142 rows=906585 loops=1)
               ->  Merge Append  (cost=181820.60..234241.66 rows=998497 width=146) (actual time=3318.200..6106.645 rows=906585 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=1.57..1.57 rows=1 width=146) (actual time=0.021..0.022 rows=0 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: quicksort  Memory: 25kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..1.55 rows=1 width=146) (actual time=0.011..0.012 rows=0 loops=1)
                                 Index Cond: (id_peer_up_info = 0)
                     ->  Unique  (cost=181819.02..214270.14 rows=998496 width=146) (actual time=3318.176..5997.081 rows=906585 loops=1)
                           ->  Sort  (cost=181819.02..184315.26 rows=998496 width=146) (actual time=3318.174..5510.898 rows=1000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 103736kB
                                 ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..38343.26 rows=998496 width=146) (actual time=0.020..214.306 rows=1000000 loops=1)
                                       Index Cond: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
 Planning Time: 1.171 ms
 JIT:
   Functions: 10
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 8.019 ms, Inlining 0.000 ms, Optimization 2.015 ms, Emission 32.624 ms, Total 42.657 ms
 Execution Time: 10409.230 ms
 ```



Merging:

```sql
explain analyze WITH
prev_status AS (
    SELECT *
    FROM snapshot_peer_up
    WHERE id_peer_up_info = 4
),
new_up_distinct AS (
    SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
    FROM event_peer_up
    WHERE id_peer_up <= 1000000 AND id_peer_up > 0
    ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
),
merged AS (
    SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM prev_status
    UNION ALL
    SELECT id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
    FROM new_up_distinct
),
merged_distinct AS (
    SELECT DISTINCT ON (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip) *
    FROM merged
    ORDER BY bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC
)
INSERT INTO snapshot_peer_up(id_peer_up_info, id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database)
SELECT 5 AS id_peer_up_info, id_peer_up, seq, "timestamp", timestamp_event, timestamp_arrival, event_type, bmp_router, bmp_router_port, bmp_msg_type, writer_id, peer_ip, peer_asn, peer_type, peer_type_str, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_port, remote_port, local_ip, bmp_peer_up_info_string, timestamp_database
FROM merged_distinct;
```

https://explain.depesz.com/s/awHD
```
 Insert on snapshot_peer_up  (cost=536280.96..737492.66 rows=2804728 width=154) (actual time=18916.474..18916.477 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=536280.96..737492.66 rows=2804728 width=154) (actual time=7061.744..15823.505 rows=906585 loops=1)
         ->  Unique  (cost=536280.96..695421.74 rows=2804728 width=146) (actual time=7061.667..15069.408 rows=906585 loops=1)
               ->  Merge Append  (cost=536280.96..611279.90 rows=2804728 width=146) (actual time=7061.666..14430.095 rows=2719755 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=354461.92..358977.50 rows=1806232 width=146) (actual time=3670.149..6949.986 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..69138.69 rows=1806232 width=146) (actual time=662.787..1266.870 rows=1813170 loops=1)
                                 Index Cond: (id_peer_up_info = 4)
                     ->  Unique  (cost=181819.02..214270.14 rows=998496 width=146) (actual time=3391.508..5993.291 rows=906585 loops=1)
                           ->  Sort  (cost=181819.02..184315.26 rows=998496 width=146) (actual time=3391.505..5542.022 rows=1000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 103736kB
                                 ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..38343.26 rows=998496 width=146) (actual time=0.050..222.914 rows=1000000 loops=1)
                                       Index Cond: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
 Planning Time: 1.334 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 4.791 ms, Inlining 24.470 ms, Optimization 373.568 ms, Emission 264.313 ms, Total 667.142 ms
 Execution Time: 18950.765 ms
```


```sql
 CREATE INDEX ON snapshot_peer_up (id_peer_up_info);
```

https://explain.depesz.com/s/CbGt
```
 Insert on snapshot_peer_up  (cost=538669.90..740743.58 rows=2819719 width=154) (actual time=19948.374..19948.377 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=538669.90..740743.58 rows=2819719 width=154) (actual time=7021.582..15803.260 rows=906585 loops=1)
         ->  Unique  (cost=538669.90..698447.80 rows=2819719 width=146) (actual time=7021.536..15012.191 rows=906585 loops=1)
               ->  Merge Append  (cost=538669.90..613856.23 rows=2819719 width=146) (actual time=7021.535..14365.381 rows=2719755 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=356850.87..361403.93 rows=1821223 width=146) (actual time=3605.353..6881.449 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx1 on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..69051.13 rows=1821223 width=146) (actual time=628.452..1230.125 rows=1813170 loops=1)
                                 Index Cond: (id_peer_up_info = 4)
                     ->  Unique  (cost=181819.02..214270.14 rows=998496 width=146) (actual time=3416.174..6022.522 rows=906585 loops=1)
                           ->  Sort  (cost=181819.02..184315.26 rows=998496 width=146) (actual time=3416.171..5571.080 rows=1000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 103736kB
                                 ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..38343.26 rows=998496 width=146) (actual time=0.043..219.339 rows=1000000 loops=1)
                                       Index Cond: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
 Planning Time: 1.420 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 4.824 ms, Inlining 24.773 ms, Optimization 369.991 ms, Emission 233.271 ms, Total 632.859 ms
 Execution Time: 19983.162 ms
```

```sql
 CREATE INDEX ON snapshot_peer_up (bmp_router, peer_ip, peer_asn, peer_type, is_in, is_filtered, is_loc, is_post, is_out, rd, bgp_id, local_ip, timestamp_arrival DESC);
```

https://explain.depesz.com/s/sKVT
```
 Insert on snapshot_peer_up  (cost=537191.64..738944.47 rows=2814139 width=154) (actual time=32652.350..32652.353 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=537191.64..738944.47 rows=2814139 width=154) (actual time=6988.499..16080.894 rows=906585 loops=1)
         ->  Unique  (cost=537191.64..696732.39 rows=2814139 width=146) (actual time=6988.454..15204.704 rows=906585 loops=1)
               ->  Merge Append  (cost=537191.64..612308.22 rows=2814139 width=146) (actual time=6988.454..14526.269 rows=2719755 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=355372.61..359911.71 rows=1815643 width=146) (actual time=3657.517..7002.704 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx1 on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..68495.08 rows=1815643 width=146) (actual time=644.924..1230.850 rows=1813170 loops=1)
                                 Index Cond: (id_peer_up_info = 4)
                     ->  Unique  (cost=181819.02..214270.14 rows=998496 width=146) (actual time=3330.928..6002.138 rows=906585 loops=1)
                           ->  Sort  (cost=181819.02..184315.26 rows=998496 width=146) (actual time=3330.926..5524.733 rows=1000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 103736kB
                                 ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..38343.26 rows=998496 width=146) (actual time=0.043..214.950 rows=1000000 loops=1)
                                       Index Cond: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
 Planning Time: 1.455 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 4.866 ms, Inlining 24.512 ms, Optimization 375.845 ms, Emission 244.173 ms, Total 649.395 ms
 Execution Time: 32684.503 ms
```

sorting false:
https://explain.depesz.com/s/KngAc
```
 Insert on snapshot_peer_up  (cost=10000351909.25..10001563196.90 rows=2798285 width=154) (actual time=48080.528..48080.530 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=10000351909.25..10001563196.90 rows=2798285 width=154) (actual time=3567.579..35486.228 rows=906585 loops=1)
         ->  Unique  (cost=10000351909.25..10001521222.62 rows=2798285 width=146) (actual time=3567.559..34552.355 rows=906585 loops=1)
               ->  Merge Append  (cost=10000351909.25..10001437274.07 rows=2798285 width=146) (actual time=3567.558..33830.141 rows=2719755 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=10000351908.67..10000356408.15 rows=1799789 width=146) (actual time=3567.472..6996.477 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx1 on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..67648.74 rows=1799789 width=146) (actual time=629.862..1189.503 rows=1813170 loops=1)
                                 Index Cond: (id_peer_up_info = 4)
                     ->  Unique  (cost=0.56..1042898.11 rows=998496 width=146) (actual time=0.078..25212.974 rows=906585 loops=1)
                           ->  Index Scan using _hyper_4_1_chunk_event_peer_up_bmp_router_peer_ip_peer_asn_peer on _hyper_4_1_chunk  (cost=0.56..1012943.23 rows=998496 width=146) (actual time=0.076..24698.082 rows=1000000 loops=1)
                                 Filter: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
                                 Rows Removed by Filter: 21000000
 Planning Time: 1.474 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 4.848 ms, Inlining 24.789 ms, Optimization 371.406 ms, Emission 233.274 ms, Total 634.318 ms
 Execution Time: 48101.813 ms
(20 rows)

```








No INDEX:

```
 Insert on snapshot_peer_up  (cost=1320768.70..1522619.27 rows=2816145 width=154) (actual time=19277.774..19277.776 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=1320768.70..1522619.27 rows=2816145 width=154) (actual time=8732.964..17471.508 rows=906585 loops=1)
         ->  Unique  (cost=1320768.70..1480377.10 rows=2816145 width=146) (actual time=8732.923..16743.954 rows=906585 loops=1)
               ->  Merge Append  (cost=1320768.70..1395892.75 rows=2816145 width=146) (actual time=8732.922..16090.571 rows=2719755 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=508928.44..513473.66 rows=1818089 width=146) (actual time=3944.247..7238.084 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Seq Scan on snapshot_peer_up snapshot_peer_up_1  (cost=0.00..221645.86 rows=1818089 width=146) (actual time=796.626..1521.676 rows=1813170 loops=1)
                                 Filter: (id_peer_up_info = 4)
                                 Rows Removed by Filter: 5692979
                     ->  Unique  (cost=811840.25..844277.07 rows=998056 width=146) (actual time=4788.666..7377.645 rows=906585 loops=1)
                           ->  Sort  (cost=811840.25..814335.39 rows=998056 width=146) (actual time=4788.664..6934.806 rows=1000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 103736kB
                                 ->  Seq Scan on _hyper_4_1_chunk  (cost=0.00..668432.00 rows=998056 width=146) (actual time=0.039..1677.711 rows=1000000 loops=1)
                                       Filter: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
                                       Rows Removed by Filter: 21000000
 Planning Time: 1.348 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 5.994 ms, Inlining 24.404 ms, Optimization 369.474 ms, Emission 233.395 ms, Total 633.266 ms
 Execution Time: 19312.677 ms
```

Minimal index:
```sql
CREATE INDEX ON snapshot_peer_up (id_peer_up_info);
CREATE INDEX ON event_peer_up(id_peer_up);


```
 Insert on snapshot_peer_up  (cost=535293.44..736633.07 rows=2806953 width=154) (actual time=18807.061..18807.063 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=535293.44..736633.07 rows=2806953 width=154) (actual time=7002.943..15832.897 rows=906585 loops=1)
         ->  Unique  (cost=535293.44..694528.78 rows=2806953 width=146) (actual time=7002.890..15052.711 rows=906585 loops=1)
               ->  Merge Append  (cost=535293.44..610320.19 rows=2806953 width=146) (actual time=7002.889..14400.342 rows=2719755 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=353474.40..357995.55 rows=1808457 width=146) (actual time=3630.609..6924.885 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..67783.23 rows=1808457 width=146) (actual time=640.729..1225.464 rows=1813170 loops=1)
                                 Index Cond: (id_peer_up_info = 4)
                     ->  Unique  (cost=181819.02..214270.14 rows=998496 width=146) (actual time=3372.272..5978.906 rows=906585 loops=1)
                           ->  Sort  (cost=181819.02..184315.26 rows=998496 width=146) (actual time=3372.270..5526.147 rows=1000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 103736kB
                                 ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..38343.26 rows=998496 width=146) (actual time=0.039..231.533 rows=1000000 loops=1)
                                       Index Cond: ((id_peer_up <= 1000000) AND (id_peer_up > 0))
 Planning Time: 1.506 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 4.861 ms, Inlining 24.541 ms, Optimization 372.019 ms, Emission 243.739 ms, Total 645.160 ms
 Execution Time: 18843.644 ms
```

Good enough.

What if we use 5M?
```
 Insert on snapshot_peer_up  (cost=1330796.72..1926343.42 rows=6852733 width=154) (actual time=64734.088..64734.091 rows=0 loops=1)
   ->  Subquery Scan on merged_distinct  (cost=1330796.72..1926343.42 rows=6852733 width=154) (actual time=20348.496..55689.129 rows=2660939 loops=1)
         ->  Unique  (cost=1330796.72..1823552.43 rows=6852733 width=146) (actual time=20348.450..53455.447 rows=2660939 loops=1)
               ->  Merge Append  (cost=1330796.72..1617970.44 rows=6852733 width=146) (actual time=20348.449..52253.735 rows=4474109 loops=1)
                     Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                     ->  Sort  (cost=354636.08..359173.25 rows=1814869 width=146) (actual time=3576.800..6913.188 rows=1813170 loops=1)
                           Sort Key: snapshot_peer_up_1.bmp_router, snapshot_peer_up_1.peer_ip, snapshot_peer_up_1.peer_asn, snapshot_peer_up_1.peer_type, snapshot_peer_up_1.is_in, snapshot_peer_up_1.is_filtered, snapshot_peer_up_1.is_loc, snapshot_peer_up_1.is_post, snapshot_peer_up_1.is_out, snapshot_peer_up_1.rd, snapshot_peer_up_1.bgp_id, snapshot_peer_up_1.local_ip, snapshot_peer_up_1.timestamp_arrival DESC
                           Sort Method: external merge  Disk: 188096kB
                           ->  Index Scan using snapshot_peer_up_id_peer_up_info_idx on snapshot_peer_up snapshot_peer_up_1  (cost=0.43..67885.14 rows=1814869 width=146) (actual time=637.000..1193.457 rows=1813170 loops=1)
                                 Index Cond: (id_peer_up_info = 4)
                     ->  Unique  (cost=976160.63..1139891.21 rows=5037864 width=146) (actual time=16771.641..42962.409 rows=2660939 loops=1)
                           ->  Sort  (cost=976160.63..988755.29 rows=5037864 width=146) (actual time=16771.638..40859.533 rows=5000000 loops=1)
                                 Sort Key: _hyper_4_1_chunk.bmp_router, _hyper_4_1_chunk.peer_ip, _hyper_4_1_chunk.peer_asn, _hyper_4_1_chunk.peer_type, _hyper_4_1_chunk.is_in, _hyper_4_1_chunk.is_filtered, _hyper_4_1_chunk.is_loc, _hyper_4_1_chunk.is_post, _hyper_4_1_chunk.is_out, _hyper_4_1_chunk.rd, _hyper_4_1_chunk.bgp_id, _hyper_4_1_chunk.local_ip, _hyper_4_1_chunk.timestamp_arrival DESC
                                 Sort Method: external merge  Disk: 518696kB
                                 ->  Index Scan using _hyper_4_1_chunk_event_peer_up_id_peer_up_idx on _hyper_4_1_chunk  (cost=0.44..193452.22 rows=5037864 width=146) (actual time=0.039..1142.585 rows=5000000 loops=1)
                                       Index Cond: ((id_peer_up <= 5000000) AND (id_peer_up > 0))
 Planning Time: 1.393 ms
 JIT:
   Functions: 10
   Options: Inlining true, Optimization true, Expressions true, Deforming true
   Timing: Generation 5.190 ms, Inlining 24.712 ms, Optimization 376.655 ms, Emission 235.219 ms, Total 641.776 ms
 Execution Time: 64800.713 ms
```

With 5M it is actually not that bad, with only a 3.5 factor, instead of 5. (the old state was keeping the same dimension)


## INsertion test 2

```
\copy (SELECT * FROM event_stats WHERE id_stats <= 10000000) to '/event_stats_10M.csv' with csv
docker cp timescale:/event_stats_10M.csv .

docker run --rm -v /home/taatomae/BMP-IPFIX-Visualization/benchmark/event_stats_10M.csv:/event_stats_10M.csv -it golang bash
go get github.com/timescale/benchmark-postgres
cd $GOPATH/src/github.com/timescale/benchmark-postgres/cmd/timescaledb-parallel-copy
go get .
go install
```

## With triggers

```
timescaledb-parallel-copy --connection "host=10.212.226.67 port=8098 user=l3visualization_test password=postgres_password sslmode=disable" --db-name=l3visualization_test --table=event_stats --verbose --reporting-period=10s --file=/event_stats_10M.csv --copy-options="NULL ''"
```

```
at 10s, row rate 49999.072217/sec (period), row rate 49999.072217/sec (overall), 5.000000E+05 total rows
at 20s, row rate 48495.500379/sec (period), row rate 49247.258398/sec (overall), 9.850000E+05 total rows
at 30s, row rate 13001.270417/sec (period), row rate 37166.497863/sec (overall), 1.115000E+06 total rows
at 40s, row rate 38999.828674/sec (period), row rate 37624.830514/sec (overall), 1.505000E+06 total rows
at 50s, row rate 49999.920530/sec (period), row rate 40099.842745/sec (overall), 2.005000E+06 total rows
at 1m0s, row rate 40000.162745/sec (period), row rate 40083.229522/sec (overall), 2.405000E+06 total rows
at 1m10s, row rate 24000.080343/sec (period), row rate 37785.648476/sec (overall), 2.645000E+06 total rows
at 1m20s, row rate 35499.898935/sec (period), row rate 37499.929507/sec (overall), 3.000000E+06 total rows
at 1m30s, row rate 49999.941000/sec (period), row rate 38888.818809/sec (overall), 3.500000E+06 total rows
at 1m40s, row rate 44000.326716/sec (period), row rate 39399.965354/sec (overall), 3.940000E+06 total rows
at 1m50s, row rate 5999.960219/sec (period), row rate 36363.585377/sec (overall), 4.000000E+06 total rows
at 2m0s, row rate 49999.535984/sec (period), row rate 37499.922800/sec (overall), 4.500000E+06 total rows
at 2m10s, row rate 50000.480910/sec (period), row rate 38461.493829/sec (overall), 5.000000E+06 total rows
at 2m20s, row rate 13000.068401/sec (period), row rate 36642.831430/sec (overall), 5.130000E+06 total rows
at 2m30s, row rate 36999.704346/sec (period), row rate 36666.623119/sec (overall), 5.500000E+06 total rows
at 2m40s, row rate 50000.064100/sec (period), row rate 37499.961251/sec (overall), 6.000000E+06 total rows
at 2m50s, row rate 26500.149201/sec (period), row rate 36852.917541/sec (overall), 6.265000E+06 total rows
at 3m0s, row rate 23499.393495/sec (period), row rate 36111.037460/sec (overall), 6.500000E+06 total rows
at 3m10s, row rate 50000.907796/sec (period), row rate 36842.069281/sec (overall), 7.000000E+06 total rows
at 3m20s, row rate 50000.172836/sec (period), row rate 37499.971688/sec (overall), 7.500000E+06 total rows
at 3m30s, row rate 13000.037220/sec (period), row rate 36333.312162/sec (overall), 7.630000E+06 total rows
at 3m40s, row rate 36999.758528/sec (period), row rate 36363.605350/sec (overall), 8.000000E+06 total rows
at 3m50s, row rate 50000.033600/sec (period), row rate 36956.492670/sec (overall), 8.500000E+06 total rows
at 4m0s, row rate 29500.166528/sec (period), row rate 36645.814329/sec (overall), 8.795000E+06 total rows
at 4m10s, row rate 20499.919940/sec (period), row rate 35999.976454/sec (overall), 9.000000E+06 total rows
at 4m20s, row rate 50000.018955/sec (period), row rate 36538.439092/sec (overall), 9.500000E+06 total rows
at 4m30s, row rate 49999.977020/sec (period), row rate 37037.014497/sec (overall), 1.000000E+07 total rows
COPY 10000000, took 4m37.954944182s with 1 worker(s) (mean rate 35977.053869/sec)
```

4 workers:

```
at 10s, row rate 177481.101795/sec (period), row rate 177481.101795/sec (overall), 1.775000E+06 total rows
at 20s, row rate 72506.702636/sec (period), row rate 124999.122600/sec (overall), 2.500000E+06 total rows
at 30s, row rate 50000.381943/sec (period), row rate 99999.786677/sec (overall), 3.000000E+06 total rows
at 40s, row rate 58498.415401/sec (period), row rate 89624.249675/sec (overall), 3.585000E+06 total rows
at 50s, row rate 41500.905604/sec (period), row rate 79999.813340/sec (overall), 4.000000E+06 total rows
at 1m0s, row rate 46500.436597/sec (period), row rate 74416.638423/sec (overall), 4.465000E+06 total rows
at 1m10s, row rate 60999.608395/sec (period), row rate 72499.909924/sec (overall), 5.075000E+06 total rows
at 1m20s, row rate 49499.854025/sec (period), row rate 69624.898644/sec (overall), 5.570000E+06 total rows
at 1m30s, row rate 43000.047425/sec (period), row rate 66666.588570/sec (overall), 6.000000E+06 total rows
at 1m40s, row rate 30000.049410/sec (period), row rate 62999.943955/sec (overall), 6.300000E+06 total rows
at 1m50s, row rate 66999.789681/sec (period), row rate 63363.567037/sec (overall), 6.970000E+06 total rows
at 2m0s, row rate 53000.020967/sec (period), row rate 62499.939377/sec (overall), 7.500000E+06 total rows
at 2m10s, row rate 50000.049140/sec (period), row rate 61538.411092/sec (overall), 8.000000E+06 total rows
at 2m20s, row rate 8499.340597/sec (period), row rate 57749.636014/sec (overall), 8.085000E+06 total rows
at 2m30s, row rate 64505.062177/sec (period), row rate 58199.962122/sec (overall), 8.730000E+06 total rows
at 2m40s, row rate 73500.033376/sec (period), row rate 59156.215584/sec (overall), 9.465000E+06 total rows
at 2m50s, row rate 53000.127730/sec (period), row rate 58794.093789/sec (overall), 9.995000E+06 total rows
at 3m0s, row rate 499.997861/sec (period), row rate 55555.521058/sec (overall), 1.000000E+07 total rows
at 3m10s, row rate 0.000000/sec (period), row rate 52631.538675/sec (overall), 1.000000E+07 total rows
at 3m20s, row rate 0.000000/sec (period), row rate 49999.968980/sec (overall), 1.000000E+07 total rows
```

```
 Modify	id_snapshot_event_stats_info	timestamp_start	timestamp_end	timestamp_analyzed	max_id_snapshot_event_stats_info
 edit	1	2021-01-21 08:50:21.311946+00	2021-01-21 08:50:21.311946+00	1611219021	500000
 edit	2	2021-01-21 08:50:38.011834+00	2021-01-21 08:50:38.011834+00	1611219038	1117974
 edit	3	2021-01-21 08:50:54.595447+00	2021-01-21 08:50:54.595447+00	1611219055	1530584
 edit	4	2021-01-21 08:51:09.311134+00	2021-01-21 08:51:09.311134+00	1611219069	2113081
 edit	5	2021-01-21 08:51:25.905965+00	2021-01-21 08:51:25.905965+00	1611219086	2500000
 edit	6	2021-01-21 08:51:40.36824+00	2021-01-21 08:51:40.36824+00	1611219100	3000000
 edit	7	2021-01-21 08:51:56.234648+00	2021-01-21 08:51:56.234648+00	1611219116	3500000
 edit	8	2021-01-21 08:52:12.723991+00	2021-01-21 08:52:12.723991+00	1611219133	4000000
 edit	9	2021-01-21 08:52:28.469129+00	2021-01-21 08:52:28.469129+00	1611219148	4500000
 edit	10	2021-01-21 08:52:44.190355+00	2021-01-21 08:52:44.190355+00	1611219164	5000000
 edit	11	2021-01-21 08:52:59.87053+00	2021-01-21 08:52:59.87053+00	1611219180	5500000
 edit	12	2021-01-21 08:53:15.633441+00	2021-01-21 08:53:15.633441+00	1611219196	6000000
 edit	13	2021-01-21 08:53:31.301333+00	2021-01-21 08:53:31.301333+00	1611219211	6500000
 edit	14	2021-01-21 08:53:47.146466+00	2021-01-21 08:53:47.146466+00	1611219227	7000000
 edit	15	2021-01-21 08:54:02.925695+00	2021-01-21 08:54:02.925695+00	1611219243	7500000
 edit	16	2021-01-21 08:54:18.876391+00	2021-01-21 08:54:18.876391+00	1611219259	8000000
 edit	17	2021-01-21 08:54:34.716546+00	2021-01-21 08:54:34.716546+00	1611219275	8500000
 edit	18	2021-01-21 08:54:50.275011+00	2021-01-21 08:54:50.275011+00	1611219290	9000000
 edit	19	2021-01-21 08:55:06.729556+00	2021-01-21 08:55:06.729556+00	1611219307	9500000
 edit	20	2021-01-21 08:55:22.451821+00	2021-01-21 08:55:22.451821+00	1611219322	10000000
```

## Without triggers

```
at 10s, row rate 97498.968237/sec (period), row rate 97498.968237/sec (overall), 9.750000E+05 total rows
at 20s, row rate 100000.317371/sec (period), row rate 98749.634202/sec (overall), 1.975000E+06 total rows
at 30s, row rate 81499.699886/sec (period), row rate 92999.656180/sec (overall), 2.790000E+06 total rows
at 40s, row rate 87994.540564/sec (period), row rate 91748.322522/sec (overall), 3.670000E+06 total rows
at 50s, row rate 99506.487574/sec (period), row rate 93299.851907/sec (overall), 4.665000E+06 total rows
at 1m0s, row rate 81994.233911/sec (period), row rate 91415.474312/sec (overall), 5.485000E+06 total rows
at 1m10s, row rate 93006.306367/sec (period), row rate 91642.720285/sec (overall), 6.415000E+06 total rows
at 1m20s, row rate 95999.894621/sec (period), row rate 92187.366888/sec (overall), 7.375000E+06 total rows
at 1m30s, row rate 83999.852009/sec (period), row rate 91277.642756/sec (overall), 8.215000E+06 total rows
at 1m40s, row rate 91500.627877/sec (period), row rate 91299.941101/sec (overall), 9.130000E+06 total rows
COPY 10000000, took 1m48.936239834s with 1 worker(s) (mean rate 91796.816333/sec)
```

4 workers

```
at 10s, row rate 236998.283919/sec (period), row rate 236998.283919/sec (overall), 2.370000E+06 total rows
at 20s, row rate 228999.767290/sec (period), row rate 232999.038052/sec (overall), 4.660000E+06 total rows
at 30s, row rate 217001.555771/sec (period), row rate 227666.584122/sec (overall), 6.830000E+06 total rows
at 40s, row rate 211998.272193/sec (period), row rate 223749.483262/sec (overall), 8.950000E+06 total rows
COPY 10000000, took 44.754160649s with 4 worker(s) (mean rate 223442.912457/sec)
```

Single server, 10M records compute_latest_snapshot('event_stats'): 203.589s

=> do not use triggers, use cronjob that once every minute count the number of new rows and, if they are more than
a specified amount, then calculate state. Advantage: no concurrent state computation.



