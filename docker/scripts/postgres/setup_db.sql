-- CREATE OR REPLACE FUNCTION varchar_to_timestamp (varchar) RETURNS timestamptz AS $$ SELECT to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS.USZ') $$ LANGUAGE SQL;
-- CREATE CAST (varchar as timestamptz ) WITH FUNCTION varchar_to_timestamp (varchar) AS IMPLICIT;

CREATE SEQUENCE "event_init_idEventInit_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_init" (
    "idEventInit" bigint DEFAULT nextval('"event_init_idEventInit_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "timestamp_event" double precision,
    "timestamp_arrival" double precision,
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

CREATE SEQUENCE "event_log_init_idEventLogInit_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_log_init" (
    "idEventLogInit" bigint DEFAULT nextval('"event_log_init_idEventLogInit_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);

CREATE SEQUENCE "event_peer_down_idEventPeerDown_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_peer_down" (
    "idEventPeerDown" bigint DEFAULT nextval('"event_peer_down_idEventPeerDown_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "timestamp_event" double precision,
    "timestamp_arrival" double precision,
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

CREATE SEQUENCE "event_peer_up_idEventPeerUp_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_peer_up" (
    "idEventPeerUp" bigint DEFAULT nextval('"event_peer_up_idEventPeerUp_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "timestamp_event" double precision,
    "timestamp_arrival" double precision,
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

CREATE SEQUENCE "event_route_monitor_idEventRouteMonitor_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_route_monitor" (
    "idEventRouteMonitor" bigint DEFAULT nextval('"event_route_monitor_idEventRouteMonitor_seq"') NOT NULL,
    "log_type" character varying(32) NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
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
    "timestamp_arrival" double precision,
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


CREATE SEQUENCE "event_stats_idEventStats_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_stats" (
    "idEventStats" bigint DEFAULT nextval('"event_stats_idEventStats_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "timestamp_event" double precision,
    "timestamp_arrival" double precision,
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


CREATE SEQUENCE "event_log_close_idEventLogClose_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_log_close" (
    "idEventLogClose" bigint DEFAULT nextval('"event_log_close_idEventLogClose_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);


CREATE SEQUENCE "event_term_idEventTerm_seq" AS BIGINT INCREMENT 1 START 1;
CREATE TABLE "public"."event_term" (
    "idEventTerm" bigint DEFAULT nextval('"event_term_idEventTerm_seq"') NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" double precision,
    "timestamp_event" double precision,
    "timestamp_arrival" double precision,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_init_info_string" text,
    "bmp_term_info_reason" text,
    "timestamp_database" timestamptz DEFAULT now() NOT NULL
) WITH (oids = false);
