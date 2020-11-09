var stepData = []
var druidReq
var num

function rm_ex_resp_steps(data) {

    stepData = data
    num = 0
    var forwardBtn = document.getElementById("rm_ex_forward");
    forwardBtn.disabled = ""
    var fastForwardBtn = document.getElementById("rm_ex_fastForward");
    fastForwardBtn.disabled = ""
}

function rm_ex_resp(data) {
    for(msg of data)
    	rm_ex_changeGraph(msg)
    draw_ctrl()

    fromTime = new Date(document.getElementById("rm_ex_from").value).valueOf()
    toTime = new Date(document.getElementById("rm_ex_to").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(toTime)

    druidReq.intervals = [tmpDate.toISOString()+'/'+tmpDate2.toISOString()]
    druidReq.rcvr = 'ctrlResp'
    druidReq.callbackFunc = rm_ex_resp_steps

    sendDruidRequest(druidReq)
}

function rm_ex_changeGraph(msg) {

    if(msg.log_type == 'withdraw') 
	rm_ex_withdrawAction(msg)
    else if(msg.log_type == 'update')
	rm_ex_updateAction(msg)
}


function rm_ex_confirm() {
    var vpnid, rib
    var e = document.getElementById("rm_ex_vpnid")

    vpnid = e.options[e.selectedIndex].value

    e = document.getElementById("rm_ex_rib")
    rib = e.options[e.selectedIndex].value

    var initTime = new Date(document.getElementById("rm_ex_init").value).valueOf()
    var fromTime = new Date(document.getElementById("rm_ex_from").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(initTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(fromTime)

    var filters = []
  
    var notfilter = { "type": "columnComparison", "dimensions": ["peer_ip", "bgp_nexthop"] }
    var tmpFilter = {"type": "not", "field": notfilter}
    filters.push(tmpFilter)

    
    notfilter = { "type": "regex", "dimension": "peer_ip", "pattern": "127.0.0.1"}
    tmpFilter = {"type": "not", "field": notfilter}
    filters.push(tmpFilter)
    
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
	filters.push({"type": "selector", "dimension": "is_in", "value": ""})
	filters.push({"type": "selector", "dimension": "is_post", "value": "0"})
	break;
    case "post_out":

	filters.push({"type": "selector", "dimension": "is_in", "value": ""})
	filters.push({"type": "selector", "dimension": "is_post", "value": "1"})
	break;
    case "loc_rib":
	filters.push({"type": "selector", "dimension": "is_loc", "value": "1"})
    default:
    }

    filters.push({"type": "regex", "dimension": "comms", "pattern": vpnid})

    var filter = { "type": "and", "fields": filters}
    console.log(tmpDate, tmpDate2)
    druidReq = {
	queryType: 'scan',
	dataSource: 'rm',
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
 	callbackFunc: rm_ex_resp
     }
    druidReq.intervals =  [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],
    console.log(druidReq)
    console.log(tmpDate.toISOString()+'/'+tmpDate2.toISOString())

    sendDruidRequest(druidReq)
}


function rm_ex_forward() {
    if(num >= stepData.length) {
	console.log("End of data")
	return
    }

    if(num < stepData.length) {
	var msg = stepData[num++]
	document.getElementById("rm_ex_cm").value = JSON.stringify(msg,null,2);

	rm_ex_changeGraph(msg)
	
	draw_ctrl()
	add_marker(msg.__time)
    }
}

function rm_ex_fastForward() {

    var count = 0
    while(count < 5) {
	rm_ex_forward()
	count++
    }
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

function rm_ex_updateAction(msg) {

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
		document.getElementById("rm_ex_pf").value = text;
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

function rm_ex_withdrawAction(msg) {

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





