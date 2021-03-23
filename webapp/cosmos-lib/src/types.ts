interface BMPGeneral {
  id: number;
  seq: number;
  timestamp_event: number | null;
  timestamp_database: Date;
  event_type: string | null;
  bmp_msg_type: string | null;
  bmp_router: string;
  bmp_router_port: number | null;
  writer_id: string | null;
  local_ip: string | null;
  local_port: number | null;
  peer_ip: string | null;
  remote_port: number | null;
  peer_asn: number | null;
  peer_type: number | null;
  peer_type_str: string | null;
  is_in: boolean | null;
  is_filtered: boolean | null;
  is_loc: boolean | null;
  is_post: boolean | null;
  is_out: boolean | null;
  rd: string | null;
  bgp_id: string | null;
  bmp_peer_up_info_string: string | null;
  bmp_init_info_string: string | null;
  bmp_init_info_sysdescr: string | null;
  bmp_init_info_sysname: string | null;
  reason_type: number | null;
  reason_str: string | null;
  reason_loc_code: string | null;
  log_type: string | null;
  afi: number | null;
  safi: number | null;
  ip_prefix: string | null;
  bgp_nexthop: string | null;
  as_path: string[] | null;
  as_path_id: number | null;
  comms: string[] | null;
  ecomms: string[] | null;
  lcomms: string[] | null;
  origin: string | null;
  local_pref: number | null;
  med: number | null;
  aigp: number | null;
  psid_li: number | null;
  label: string | null;
  peer_tcp_port: number | null;
  counter_type: number | null;
  counter_type_str: string | null;
  counter_value: number | null;
  bmp_term_info_reason: string | null;
  bmp_term_info_string: string | null;
}

interface BMPDump extends BMPGeneral {
  timestamp: number;
  timestamp_arrival: number | null;
  dump_period: number | null;
  entries: number | null;
  tables: number | null;
}

interface BMPEvent extends BMPGeneral {
  timestamp: number | null;
  timestamp_arrival: number;
}

interface VirtualRouter {
  bmp_router: string;
  rd: string | null;
  timestamp?: number;
}

interface VirtualRouterDump extends VirtualRouter {
  seq: number;
}

interface StatePkt {
  timestamp: number;
  state: {
    [key: string]: {
      virtualRouter: VirtualRouter;
      events: (BMPDump | BMPEvent)[];
    };
  };
}

interface UpgradePkt {
  timestamp: number;
  upgrade: {
    [key: string]: {
      virtualRouter: VirtualRouter;
      events: BMPEvent[];
    };
  };
}

interface EventCount {
  startgroup: number;
  endgroup: number;
  count: number;
}

export {
  BMPDump,
  BMPEvent,
  StatePkt,
  UpgradePkt,
  VirtualRouter,
  VirtualRouterDump,
  EventCount,
};
