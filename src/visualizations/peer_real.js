var druidReq
var fromTime, toTime

function peer_real_periodic() {

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(Date.now())

    console.log(tmpDate.toISOString()+'/'+tmpDate2.toISOString())
    druidReq.intervals = [tmpDate.toISOString()+'/'+tmpDate2.toISOString()]
    druidReq.rcvr = 'ctrlResp'
    druidReq.callbackFunc = peer_real_periodic_resp

    sendDruidRequest(druidReq)
}

function peer_real_periodic_resp(data) {

    for(msg of data) {
    	peer_real_changeGraph(msg)
	fromTime = msg.__time
    }
    draw_ctrl()
}

function peer_real_resp(data) {

    for(msg of data) {
    	peer_real_changeGraph(msg)
	fromTime = msg.__time
    }
    draw_ctrl()

    setInterval(peer_real_periodic, 3000);    
}

function peer_real_changeGraph(msg) {
    console.log(msg)
    var src = getNode({id: msg.local_ip})
    if(src == undefined)
	src = setNode(
	    {
		id: msg.local_ip,
		label: msg.local_ip
	    }
	)

    var targ = getNode({id: msg.peer_ip})
    if(targ == undefined)
    	targ = setNode(
	    {
		id: msg.peer_ip,
		label:msg.peer_ip
	    }
	)

    setEdge(
	{
	    source: src,
	    target: targ,
	    replace: [],
	    append: []
	}
    )
}


function peer_real_confirm() {
    var rib, peer_type, router
    var e = document.getElementById("peer_real_rib")
    rib = e.options[e.selectedIndex].value
    e = document.getElementById("peer_real_peer_type")
    peer_type = e.options[e.selectedIndex].value
    e = document.getElementById("peer_real_router")
    router = e.options[e.selectedIndex].value
        
    initTime = new Date(document.getElementById("peer_real_init").value).valueOf()
    fromTime = new Date(document.getElementById("peer_real_from").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(initTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(fromTime)

    var filters = []

    notfilter = { "type": "regex", "dimension": "peer_ip", "pattern": "192.0.2.154"}
    foo = {"type": "not", "field": notfilter}
    filters.push(foo)

    switch(rib) {
    case "pre_in":
	filters.push({"type": "regex", "dimension": "is_in", "pattern": "1"})
	filters.push({"type": "regex", "dimension": "is_post", "pattern": "0"})
	break;
    case "post_in":

	filters.push({"type": "regex", "dimension": "is_in", "pattern": "1"})
	filters.push({"type": "regex", "dimension": "is_post", "pattern": "1"})
	break;
    default:
    }

    filters.push({"type": "regex", "dimension": "bmp_router", "pattern": router})

    var filter = { "type": "and", "fields": filters}
    druidReq = {
	queryType: 'scan',
	dataSource: 'peer_up',
	columns: [
	    "__time",
	    "bmp_router",
	    "peer_ip",
	    "local_ip",
	    "peer_type",
	    "is_post",
	    "is_in"
	],
	filter: filter,
	intervals: [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],
	rcvr: 'ctrlResp',
	callbackFunc: peer_real_resp
    }

    sendDruidRequest(druidReq)
}
