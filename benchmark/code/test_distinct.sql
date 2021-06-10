BEGIN;
SELECT community
FROM (SELECT DISTINCT(JSONB_ARRAY_ELEMENTS_TEXT("comms")) as community
FROM dump
WHERE timestamp <= 1623086281
AND timestamp > 1623057900
) AS t
WHERE community LIKE '64497:%';
END;

-- min: 1623057900
-- max: 1623086281