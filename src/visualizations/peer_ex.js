function peer_ex_resp_steps(data) {

    stepData = data
    num = 0
    var forwardBtn = document.getElementById("peer_ex_forward");
    forwardBtn.disabled = ""
    var fastForwardBtn = document.getElementById("peer_ex_fastForward");
    fastForwardBtn.disabled = ""
}

function peer_ex_resp(data) {
    for(msg of data) {
    	if(msgFilter(msg,filter)) {
    	    peer_ex_changeGraph(msg)
    	}
    }
    draw_ctrl()

    fromTime = new Date(document.getElementById("peer_ex_from").value).valueOf()
    toTime = new Date(document.getElementById("peer_ex_to").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(toTime)

    druidReq.intervals = [tmpDate.toISOString()+'/'+tmpDate2.toISOString()]
    druidReq.rcvr = 'ctrlResp'
    druidReq.callbackFunc = peer_ex_resp_steps

    sendDruidRequest(druidReq)
}

function peer_ex_changeGraph(msg) {
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


function peer_ex_confirm() {
    var rib, peer_type, router
    var e = document.getElementById("peer_ex_rib")
    rib = e.options[e.selectedIndex].value
    e = document.getElementById("peer_ex_peer_type")
    peer_type = e.options[e.selectedIndex].value
    e = document.getElementById("peer_ex_router")
    router = e.options[e.selectedIndex].value
        
    initTime = new Date(document.getElementById("peer_ex_init").value).valueOf()
    fromTime = new Date(document.getElementById("peer_ex_from").value).valueOf()
    toTime = new Date(document.getElementById("peer_ex_to").value).valueOf()

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
	callbackFunc: peer_ex_resp
    }

    sendDruidRequest(druidReq)
}


function peer_ex_forward() {
    if(num >= stepData.length) {
	console.log("End of data")
	return
    }

    while(num < stepData.length) {
	var msg = stepData[num++]
	if(msgFilter(msg,filter)) {
	    peer_ex_changeGraph(msg)
	    draw_ctrl()
	    add_marker(msg.__time)
	    break;
	}
    }
}

function peer_ex_fastForward() {

    var count = 0
    while(count < 5) {
	peer_ex_forward()
	count++
    }

}
