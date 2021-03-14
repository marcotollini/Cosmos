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


CREATE INDEX dump_comms_rm_idx ON "dump" USING gin(comms jsonb_path_ops) WHERE bmp_msg_type = 'route_monitor';
CREATE INDEX event_comms_rm_idx ON "event" USING gin(comms jsonb_path_ops) WHERE bmp_msg_type = 'route_monitor';

CREATE INDEX dump_rd_timestamp_seq_rm_idx ON "dump" (rd, "timestamp", seq) WHERE bmp_msg_type = 'route_monitor';
