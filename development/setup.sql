DROP TABLE IF EXISTS "event_init";

CREATE TABLE "public"."event_init" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "timestamp_event" timestamptz,
    "timestamp_arrival" timestamptz,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_init_info_string" text,
    "bmp_init_info_sysdescr" text,
    "bmp_init_info_sysname" character varying(128)
) WITH (oids = false);

DROP TABLE IF EXISTS "event_log_init";

CREATE TABLE "public"."event_log_init" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer
) WITH (oids = false);


DROP TABLE IF EXISTS "event_peer_down";

CREATE TABLE "public"."event_peer_down" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "timestamp_event" timestamptz,
    "timestamp_arrival" timestamptz,
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
    "reason_loc_code" character varying(32)
) WITH (oids = false);


DROP TABLE IF EXISTS "event_peer_up";

CREATE TABLE "public"."event_peer_up" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "timestamp_event" timestamptz,
    "timestamp_arrival" timestamptz,
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
    "bmp_peer_up_info_string" text
) WITH (oids = false);


DROP TABLE IF EXISTS "event_route_monitor";

CREATE TABLE "public"."event_route_monitor" (
    "log_type" character varying(32) NOT NULL,
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
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
    "timestamp_arrival" timestamptz,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer NOT NULL,
    "bmp_msg_type" character varying(128) NOT NULL,
    "is_in" boolean,
    "is_filtered" boolean,
    "is_loc" boolean,
    "is_post" boolean,
    "is_out" boolean
) WITH (oids = false);


DROP TABLE IF EXISTS "event_stats";

CREATE TABLE "public"."event_stats" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "timestamp_event" timestamptz,
    "timestamp_arrival" timestamptz,
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
    "safi" integer
) WITH (oids = false);


DROP TABLE IF EXISTS "event_log_close";

CREATE TABLE "public"."event_log_close" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "event_type" character varying(32) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer
) WITH (oids = false);

DROP TABLE IF EXISTS "event_term";

CREATE TABLE "public"."event_term" (
    "seq" bigint NOT NULL,
    "timestamp" timestamptz,
    "timestamp_event" timestamptz,
    "timestamp_arrival" timestamptz,
    "event_type" character varying(32) NOT NULL,
    "bmp_router" character varying(32) NOT NULL,
    "bmp_router_port" integer,
    "bmp_msg_type" character varying(128) NOT NULL,
    "writer_id" character varying(128) NOT NULL,
    "bmp_init_info_string" text,
    "bmp_term_info_reason" text
) WITH (oids = false);