var druidReq
var fromTime, toTime

function rm_real_periodic() {

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(Date.now())

    druidReq.intervals = [tmpDate.toISOString()+'/'+tmpDate2.toISOString()]
    druidReq.rcvr = 'ctrlResp'
    druidReq.callbackFunc = rm_real_periodic_resp

    sendDruidRequest(druidReq)
}

function rm_real_periodic_resp(data) {

    for(msg of data) {
    	rm_real_changeGraph(msg)
	fromTime = msg.__time
    }
    draw_ctrl()
}

function rm_real_resp(data) {

    for(msg of data) {
    	rm_real_changeGraph(msg)
	fromTime = msg.__time
    }
    draw_ctrl()

    setInterval(rm_real_periodic, 3000);    
}

function rm_real_changeGraph(msg) {

    if(msg.log_type == 'withdraw') 
	rm_real_withdrawAction(msg)
    else if(msg.log_type == 'update')
	rm_real_updateAction(msg)
}


function rm_real_confirm() {


    
    var vpnid, rib
    var e = document.getElementById("rm_real_vpnid")

    vpnid = e.options[e.selectedIndex].value

    e = document.getElementById("rm_real_rib")
    rib = e.options[e.selectedIndex].value

    initTime = new Date(document.getElementById("rm_real_init").value).valueOf()
    fromTime = new Date(document.getElementById("rm_real_from").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(initTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(fromTime)

    var filters = []
  
    var notfilter = { "type": "columnComparison", "dimensions": ["peer_ip", "bgp_nexthop"] }
    var tmpFilter = {"type": "not", "field": notfilter}
    filters.push(tmpFilter)

    notfilter = { "type": "regex", "dimension": "peer_ip", "pattern": "127.0.0.1"}
    tmpFitler = {"type": "not", "field": notfilter}
    filters.push(tmpFitler)
    
    switch(rib) {
    case "pre_in":
	filters.push({"type": "selector", "dimension": "is_in", "value": "1"})
	filters.push({"type": "selector", "dimension": "is_post", "value": "0"})
	break;
    case "post_in":

	filters.push({"type": "selector", "dimension": "is_in", "value": "1"})
	filters.push({"type": "selector", "dimension": "is_post", "value": "1"})
	
	break;
    case "pre_out":
	filters.push({"type": "selector", "dimension": "is_in", "value": "0"})
	filters.push({"type": "selector", "dimension": "is_post", "value": "0"})
	break;
    case "post_out":

	filters.push({"type": "selector", "dimension": "is_in", "value": "0"})
	filters.push({"type": "selector", "dimension": "is_post", "value": "1"})
	break;
    case "loc_rib":
	filters.push({"type": "selector", "dimension": "is_loc", "value": "1"})
    default:
    }

    filters.push({"type": "regex", "dimension": "comms", "pattern": vpnid})

    var filter = { "type": "and", "fields": filters}
    druidReq = {
	queryType: 'scan',
	dataSource: 'nfacctd_bmp-route_monitor',
	columns: [
	    "__time",
	    "bmp_router",
	    "rd",
	    "comms",
	    "peer_ip",
	    "bgp_nexthop",
	    "ip_prefix",
	    "log_type",
	    "is_post",
	    "is_in"
	],
	filter: filter,

 	rcvr: 'ctrlResp',
 	callbackFunc: rm_real_resp
     }
    druidReq.intervals =  [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],

    sendDruidRequest(druidReq)
}

function clickCallback(d) {

    var text = ""
    if( !(d.prefix_1_2 == undefined) && d.prefix_1_2.length > 0) {
	text += d.source.id
	text += ' → '
	text += d.target.id
	text += "\n"
	d.prefix_1_2.forEach(pref => text += (pref+"\n"))
    }
    if( !(d.prefix_2_1 == undefined) && d.prefix_2_1.length > 0) {
	text += d.target.id
	text += ' → '
	text += d.source.id
	text += "\n"
	d.prefix_2_1.forEach(pref => text += (pref+"\n"))
    }
    return text
}

function rm_real_updateAction(msg) {

    var src = getNode({id: msg.peer_ip})
    if(src == undefined)
	src = setNode(
	    {
		id: msg.peer_ip,
		label: msg.peer_ip
	    }
	)

    var targ = getNode({id: msg.bgp_nexthop})
    if(targ == undefined)
    	targ = setNode(
	    {
		id: msg.bgp_nexthop,
		label: msg.bgp_nexthop
	    }
	)

    var append_p
    if(src.id < targ.id) {
	append_p = {field: 'prefix_1_2'}
    } else {
	var tmp = src
	src = targ
	targ = tmp
	append_p = {field: 'prefix_2_1'}
    }
    append_p.value = msg.ip_prefix

    setEdge(
	{
	    source: src,
	    target: targ,
	    labelCallback: function clickCallback(d) {
		var text = ""
		if( !(d.prefix_1_2 == undefined) && d.prefix_1_2.size > 0) {
		    text += d.source.id
		    text += ' → '
		    text += d.target.id
		    text += "\n"
		    d.prefix_1_2.forEach(pref => text += (pref+"\n"))
		}
		if( !(d.prefix_2_1 == undefined) && d.prefix_2_1.size > 0) {
		    text += d.target.id
		    text += ' → '
		    text += d.source.id

		    text += "\n"
		    d.prefix_2_1.forEach(pref => text += (pref+"\n"))
		}
		document.getElementById("rm_real_pf").value = text;
	    },
	    replace: [
		{ field: 'label', value: "<prefixes>" },
		{ field: 'status', value: 'update' }
	    ],
	    append: [
		append_p
	    ]
	}
    )
}

function rm_real_withdrawAction(msg) {

    var src = getNode({id: msg.peer_ip})
    var targ = getNode({id: msg.bgp_nexthop})

    if(src == undefined || targ == undefined) return

    var subtract_p
    if(src.id < targ.id) {
	subtract_p = {field: 'prefix_1_2'}
    } else {
	var tmp = src
	src = targ
	targ = tmp
	subtract_p = {field: 'prefix_2_1'}
    }
    subtract_p.value = msg.ip_prefix
    
    deleteEdge(
	{
	    source: src,
	    target: targ,
	    replace: [
		{ field: 'label', value: "<prefixes>"},
		{ field: 'status', value: 'withdraw'}
	    ],
	    subtract: [
		subtract_p
	    ]
	}
    )
}
