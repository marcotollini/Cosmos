-- CREATE OR REPLACE FUNCTION varchar_to_timestamp (varchar) RETURNS timestamptz AS $$ SELECT to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS.USZ') $$ LANGUAGE SQL;
-- CREATE CAST (varchar as timestamptz ) WITH FUNCTION varchar_to_timestamp (varchar) AS IMPLICIT;
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE "public"."event_init" (
    "idEventInit" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_init_info_string" text,
    "bmp_init_info_sysdescr" text,
    "bmp_init_info_sysname" character varying(128),
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);

CREATE TABLE "public"."event_log_init" (
    "idEventLogInit" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);

CREATE TABLE "public"."event_peer_down" (
    "idEventPeerDown" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "peer_ip" character varying(32) NOT NULL,
    "peer_asn" integer NOT NULL,
    "peer_type" integer NOT NULL,
    "peer_type_str" text,
    "rd" character varying(32),
    "reason_type" integer NOT NULL,
    "reason_str" text,
    "reason_loc_code" character varying(32),
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);

CREATE TABLE "public"."event_peer_up" (
    "idEventPeerUp" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "peer_ip" character varying(32) NOT NULL,
    "peer_asn" bigint NOT NULL,
    "peer_type" integer NOT NULL,
    "peer_type_str" text,
    "is_in" boolean,
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "rd" character varying(32),
    "bgp_id" character varying(32) NOT NULL,
    "local_port" integer NOT NULL,
    "remote_port" integer NOT NULL,
    "local_ip" character varying(32) NOT NULL,
    "bmp_peer_up_info_string" text,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);

CREATE TABLE "public"."event_route_monitor" (
    "idEventRouteMonitor" bigserial NOT NULL,
    "log_type" character varying(32) NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "afi" integer NOT NULL,
    "safi" integer NOT NULL,
    "ip_prefix" character varying(32),
    "rd" character varying(32),
    "bgp_nexthop" character varying(32),
    "as_path" jsonb,
    "as_path_id" integer,
    "comms" jsonb,
    "ecomms" jsonb,
    "lcomms"jsonb,
    "origin" character varying(5),
    "local_pref" integer,
    "med" integer,
    "aigp" integer,
    "psid_li" integer,
    "label" character varying(32),
    "peer_ip" character varying(32) NOT NULL,
    "peer_tcp_port" integer,
    "timestamp_arrival" integer,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "bmp_msg_type" character varying(128) NOT NULL,
    "is_in" boolean,
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);


CREATE TABLE "public"."event_stats" (
    "idEventStats" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "peer_ip" character varying(32) NOT NULL,
    "peer_asn" bigint NOT NULL,
    "peer_type" integer NOT NULL,
    "peer_type_str" text NOT NULL,
    "is_in" boolean,
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "rd" character varying(32),
    "counter_type" integer NOT NULL,
    "counter_type_str" text NOT NULL,
    "counter_value" bigint NOT NULL,
    "afi" integer,
    "safi" integer,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);


CREATE TABLE "public"."event_log_close" (
    "idEventLogClose" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);


CREATE TABLE "public"."event_term" (
    "idEventTerm" bigserial NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" integer,
    "timestamp_event" integer,
    "timestamp_arrival" integer,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_init_info_string" text,
    "bmp_term_info_reason" text,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);

-- snapshot tables

CREATE TABLE "public"."snapshot_peer_info" (
    "idSnapshotPeerInfo" serial NOT NULL,
    "timestamp_start" timestamptz NOT NULL,
    "timestamp_end" timestamptz NOT NULL,
    "timestamp_analyzed" timestamptz NOT NULL,
    "max_peer_up_id" bigint NOT NULL,
    "max_peer_down_id" bigint NOT NULL
) WITH (oids = false);

CREATE TABLE "public"."snapshot_peer" (
    "idSnapshotPeer" serial NOT NULL,
    "idSnapshotPeerInfo" integer NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bgp_id" character varying(32) NOT NULL,
    "local_ip" character varying(32) NOT NULL,
    "local_port" integer NOT NULL,
    "peer_ip" character varying(32) NOT NULL,
    "remote_port" integer NOT NULL,
    "peer_type" integer NOT NULL,
    "rd" character varying(32),
    "max_timestamp" integer,
    "min_timestamp_arrival" integer
) WITH (oids = false);


