DROP TABLE IF EXISTS "event_init";
DROP SEQUENCE IF EXISTS "event_init_idEventInit_seq";
CREATE SEQUENCE "event_init_idEventInit_seq" AS BIGINT INCREMENT 1 START 1 ;

CREATE TABLE "public"."event_init" (
    "idEventInit" bigint DEFAULT nextval('"event_init_idEventInit_seq"') NOT NULL,
    "__time" timestamptz NOT NULL,
    "timestamp" timestamptz,
    "event_timestamp" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "bmp_init_info_sysname" character varying(128),
    "bmp_init_info_string" text,
    "bmp_init_info_sysdescr" text,
    "seq" bigint NOT NULL
) WITH (oids = false);


DROP TABLE IF EXISTS "event_log_init";
DROP SEQUENCE IF EXISTS "event_log_init_idEventLogInit_seq";
CREATE SEQUENCE "event_log_init_idEventLogInit_seq" AS BIGINT INCREMENT 1 START 1 ;

CREATE TABLE "public"."event_log_init" (
    "idEventLogInit" bigint DEFAULT nextval('"event_log_init_idEventLogInit_seq"') NOT NULL,
    "__time" timestamptz NOT NULL,
    "timestamp" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "seq" bigint NOT NULL
) WITH (oids = false);


DROP TABLE IF EXISTS "event_peer_down";
DROP SEQUENCE IF EXISTS "event_peer_down_idEventPeerDown_seq";
CREATE SEQUENCE "event_peer_down_idEventPeerDown_seq" AS BIGINT INCREMENT 1 START 1 ;

CREATE TABLE "public"."event_peer_down" (
    "idEventPeerDown" bigint DEFAULT nextval('"event_peer_down_idEventPeerDown_seq"') NOT NULL,
    "__time" timestamptz NOT NULL,
    "timestamp" timestamptz,
    "event_timestamp" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "rd" character varying(32),
    "peer_ip" character varying(32) NOT NULL,
    "peer_asn" integer,
    "peer_type" character varying(32),
    "reason_type" integer,
    "seq" bigint NOT NULL
) WITH (oids = false);


DROP TABLE IF EXISTS "event_peer_up";
DROP SEQUENCE IF EXISTS "event_peer_up_idEventPeerUp_seq";
CREATE SEQUENCE "event_peer_up_idEventPeerUp_seq" AS BIGINT INCREMENT 1 START 1 ;

CREATE TABLE "public"."event_peer_up" (
    "idEventPeerUp" bigint DEFAULT nextval('"event_peer_up_idEventPeerUp_seq"') NOT NULL,
    "__time" timestamptz NOT NULL,
    "timestamp" timestamptz,
    "event_timestamp" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "rd" character varying(32),
    "local_ip" character varying(32),
    "bgp_id" character varying(32),
    "peer_ip" character varying(32),
    "peer_asn" integer,
    "peer_type" character varying(32),
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "local_port" integer,
    "remote_port" integer,
    "seq" bigint NOT NULL
) WITH (oids = false);


DROP TABLE IF EXISTS "event_route_monitor";
DROP SEQUENCE IF EXISTS "event_route_monitor_idEventRouteMonitor_seq";
CREATE SEQUENCE "event_route_monitor_idEventRouteMonitor_seq" AS BIGINT INCREMENT 1 START 1 ;

CREATE TABLE "public"."event_route_monitor" (
    "idEventRouteMonitor" bigint DEFAULT nextval('"event_route_monitor_idEventRouteMonitor_seq"') NOT NULL,
    "__time" timestamptz NOT NULL,
    "timestamp" timestamptz,
    "event_timestamp" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "peer_ip" character varying(32),
    "peer_tcp_port" integer,
    "ip_prefix" character varying(32) NOT NULL,
    "bgp_nexthop" character varying(32),
    "rd" character varying(32),
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "afi" integer,
    "safi" integer,
    "as_path" json,
    "as_path_id" json,
    "comms" json,
    "ecomms" json,
    "lcomms"json,
    "origin" character varying(5),
    "local_pref" integer,
    "label" character varying(32),
    "is_filtered" boolean,
    "seq" bigint NOT NULL
) WITH (oids = false);


DROP TABLE IF EXISTS "event_stats";
DROP SEQUENCE IF EXISTS "event_stats_idEventStats_seq";
CREATE SEQUENCE "event_stats_idEventStats_seq" AS BIGINT INCREMENT 1 START 1 ;

CREATE TABLE "public"."event_stats" (
    "idEventStats" bigint DEFAULT nextval('"event_stats_idEventStats_seq"') NOT NULL,
    "__time" timestamptz NOT NULL,
    "timestamp" timestamptz,
    "event_timestamp" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "rd" character varying(32),
    "peer_ip" character varying(32),
    "peer_asn" integer,
    "peer_type" character varying(32),
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean,
    "counter_type" integer NOT NULL,
    "counter_value" integer NOT NULL,
    "afi" integer,
    "safi" integer,
    "seq" bigint NOT NULL
) WITH (oids = false);
