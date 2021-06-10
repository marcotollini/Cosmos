BEGIN;
SELECT time_bucket_gapfill(60, timestamp_arrival, 1623057900, 1623086281) AS start_bucket, count(*)
FROM (
    SELECT *
    FROM event
    WHERE bmp_msg_type = 'route_monitor'
    AND comms @> '"64497:1"'
    AND timestamp_arrival > 1623057900
    AND timestamp_arrival <= 1623086281
) as t
GROUP BY start_bucket
ORDER BY start_bucket;
END;