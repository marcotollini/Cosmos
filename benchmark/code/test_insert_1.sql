\set delta random(-100, 0)
-- \set timestampevent
\set ip random(0, 255)
\set prefix random(0, 10000)
BEGIN;
INSERT INTO ietf
    (seq,log_type,timestamp,is_post,is_in,peer_ip,peer_tcp_port,event_type,afi,safi,ip_prefix,bgp_nexthop,as_path,comms,ecomms,origin,local_pref,rd,label,timestamp_arrival,bmp_router,bmp_router_port,bmp_msg_type,writer_id)
    VALUES
    ('2','update',extract(epoch FROM CURRENT_TIMESTAMP),'0','1','192.0.2.3','0','log','1','128',:prefix,:ip,'"[65536,65587,65544]"','"[64496:10,64496:1001,64496:1033,64497:1]"','"[RT:10000:1,RT:65000:1]"','i','0','0:65000:1','369','1866316022','198.51.100.44','35315','route_monitor','ietfint_nfacctd-bmp01_c/3420958');
END;