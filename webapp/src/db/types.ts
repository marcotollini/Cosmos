interface BMPEvent {
  id: number;
  seq: number;
  timestamp: number;
  timestamp_event: number;
  timestamp_arrival: number;
  timestamp_database: Date;
  event_type: string;
  bmp_msg_type: string;
  bmp_router: string;
  bmp_router_port: number;
  writer_id: string;
  local_ip: string;
  local_port: number;
  peer_ip: string;
  remote_port: number;
  peer_asn: number;
  peer_type: number;
  peer_type_str: string;
  is_in: boolean;
  is_filtered: boolean;
  is_loc: boolean;
  is_post: boolean;
  is_out: boolean;
  rd: string;
  bgp_id: string;
  bmp_peer_up_info_string: string;
  bmp_init_info_string: string;
  bmp_init_info_sysdescr: string;
  bmp_init_info_sysname: string;
  reason_type: number;
  reason_str: string;
  reason_loc_code: string;
  log_type: string;
  afi: number;
  safi: number;
  ip_prefix: string;
  bgp_nexthop: string;
  as_path: string[];
  as_path_id: number;
  comms: string[];
  ecomms: string[];
  lcomms: string[];
  origin: string;
  local_pref: number;
  med: number;
  aigp: number;
  psid_li: number;
  label: string;
  peer_tcp_port: number;
  counter_type: number;
  counter_type_str: string;
  counter_value: number;
  bmp_term_info_reason: string;
  bmp_term_info_string: string;
}

interface BMPDump {
  id: number;
  seq: number;
  timestamp: number;
  timestamp_event: number;
  timestamp_arrival: number;
  timestamp_database: Date;
  event_type: string;
  bmp_msg_type: string;
  bmp_router: string;
  bmp_router_port: number;
  writer_id: string;
  local_ip: string;
  local_port: number;
  peer_ip: string;
  remote_port: number;
  peer_asn: number;
  peer_type: number;
  peer_type_str: string;
  is_in: boolean;
  is_filtered: boolean;
  is_loc: boolean;
  is_post: boolean;
  is_out: boolean;
  rd: string;
  bgp_id: string;
  bmp_peer_up_info_string: string;
  dump_period: number;
  entries: number;
  tables: number;
  bmp_init_info_string: string;
  bmp_init_info_sysdescr: string;
  bmp_init_info_sysname: string;
  reason_type: number;
  reason_str: string;
  reason_loc_code: string;
  log_type: string;
  afi: number;
  safi: number;
  ip_prefix: string;
  bgp_nexthop: string;
  as_path: string[];
  as_path_id: number;
  comms: string[];
  ecomms: string[];
  lcomms: string[];
  origin: string;
  local_pref: number;
  med: number;
  aigp: number;
  psid_li: number;
  label: string;
  peer_tcp_port: number;
  counter_type: number;
  counter_type_str: string;
  counter_value: number;
  bmp_term_info_reason: string;
  bmp_term_info_string: string;
}

export {BMPDump, BMPEvent};
