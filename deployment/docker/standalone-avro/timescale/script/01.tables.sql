-- CREATE OR REPLACE FUNCTION varchar_to_timestamp (varchar) RETURNS timestamptz AS $$ SELECT to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS.USZ') $$ LANGUAGE SQL;
-- CREATE CAST (varchar as timestamptz ) WITH FUNCTION varchar_to_timestamp (varchar) AS IMPLICIT;


CREATE TABLE "public"."event" (
    "id" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer DEFAULT date_part('epoch', NOW())::integer,
    "timestamp_database" timestamptz DEFAULT NOW(),
    "event_type" character varying(32),
    "bmp_msg_type" character varying(128),
    "bmp_router" character varying(32),
    "bmp_router_port" integer,
    "writer_id" character varying(128),
    "local_ip" character varying(32),
    "local_port" integer,
    "peer_ip" character varying(32),
    "remote_port" integer,
    "peer_asn" bigint,
    "peer_type" integer,
    "peer_type_str" text,
    "is_in" boolean,
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "rd" character varying(32),
    "bgp_id" character varying(32),
    "bmp_peer_up_info_string" text,
    -- init
    "bmp_init_info_string" text,
    "bmp_init_info_sysdescr" text,
    "bmp_init_info_sysname" character varying(128),
    -- peer down
    "reason_type" integer,
    "reason_str" text,
    "reason_loc_code" character varying(32),
    -- route monitor
    "log_type" character varying(32),
    "afi" integer,
    "safi" integer,
    "ip_prefix" character varying(32),
    "bgp_nexthop" character varying(32),
    "as_path" jsonb,
    "as_path_id" integer,
    "comms" jsonb,
    "ecomms" jsonb,
    "lcomms" jsonb,
    "origin" character varying(5),
    "local_pref" integer,
    "med" integer,
    "aigp" integer,
    "psid_li" integer,
    "label" character varying(32),
    "peer_tcp_port" integer,
    -- stats
    "counter_type" integer,
    "counter_type_str" text,
    "counter_value" bigint,
    -- term
    "bmp_term_info_reason" text,
    "bmp_term_info_string" text
) WITH (oids = false);

CREATE TABLE "public"."dump" (
    "id" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer,
    "timestamp_database" timestamptz DEFAULT NOW(),
    "event_type" character varying(32),
    "bmp_msg_type" character varying(128),
    "bmp_router" character varying(32),
    "bmp_router_port" integer,
    "writer_id" character varying(128),
    "local_ip" character varying(32),
    "local_port" integer,
    "peer_ip" character varying(32),
    "remote_port" integer,
    "peer_asn" bigint,
    "peer_type" integer,
    "peer_type_str" text,
    "is_in" boolean,
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "rd" character varying(32),
    "bgp_id" character varying(32),
    "bmp_peer_up_info_string" text,
    -- dump
    "dump_period" integer,
    "entries" integer,
    "tables" integer,
    -- init
    "bmp_init_info_string" text,
    "bmp_init_info_sysdescr" text,
    "bmp_init_info_sysname" character varying(128),
    -- peer down
    "reason_type" integer,
    "reason_str" text,
    "reason_loc_code" character varying(32),
    -- route monitor
    "log_type" character varying(32),
    "afi" integer,
    "safi" integer,
    "ip_prefix" character varying(32),
    "bgp_nexthop" character varying(32),
    "as_path" jsonb,
    "as_path_id" integer,
    "comms" jsonb,
    "ecomms" jsonb,
    "lcomms" jsonb,
    "origin" character varying(5),
    "local_pref" integer,
    "med" integer,
    "aigp" integer,
    "psid_li" integer,
    "label" character varying(32),
    "peer_tcp_port" integer,
    -- stats
    "counter_type" integer,
    "counter_type_str" text,
    "counter_value" bigint,
    -- term
    "bmp_term_info_reason" text,
    "bmp_term_info_string" text
) WITH (oids = false);

-- https://www.postgresql.org/docs/current/btree-gin.html
-- https://stackoverflow.com/questions/9025515/how-do-i-import-modules-or-install-extensions-in-postgresql-9-1
CREATE EXTENSION btree_gin;
CREATE INDEX dump_timestamp_bmp_msg_typ_comms_idx ON "event" USING gin("timestamp", bmp_msg_type, comms jsonb_path_ops);
CREATE INDEX dump_bmp_msg_type_idx ON "dump"("bmp_msg_type");


CREATE INDEX event_timestamp_arrival_bmp_msg_typ_comms_idx ON "event" USING gin(timestamp_arrival, bmp_msg_type, comms jsonb_path_ops);
CREATE INDEX event_bmp_msg_type_idx ON "event"("bmp_msg_type");


CREATE EXTENSION pgcrypto;
CREATE TABLE "public"."queries" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "payload" jsonb NOT NULL,
    "timestamp" timestamptz DEFAULT now()
) WITH (oids = false);