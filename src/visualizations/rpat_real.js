var druidReq
var fromTime, toTime

function rpat_real_periodic() {

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(Date.now())

    console.log(tmpDate.toISOString()+'/'+tmpDate2.toISOString())
    druidReq.intervals = [tmpDate.toISOString()+'/'+tmpDate2.toISOString()]
    druidReq.rcvr = 'ctrlResp'
    druidReq.callbackFunc = rpat_real_periodic_resp

    sendDruidRequest(druidReq)
}

function rpat_real_periodic_resp(data) {

    for(msg of data) {
    	rpat_real_changeGraph(msg)
	fromTime = msg.__time
    }
    draw_ctrl()
}

function rpat_real_resp(data) {

    for(msg of data) {
    	rpat_real_changeGraph(msg)
	fromTime = msg.__time
    }
    draw_ctrl()

    setInterval(rpat_real_periodic, 3000);    
}

function rpat_real_changeGraph(msg) {

    console.log(msg)
    if(msg.log_type == 'withdraw') 
	rpat_real_withdrawAction(msg)
    else if(msg.log_type == 'update')
	rpat_real_updateAction(msg)

}

function rpat_real_changeGraph(msg) {
    rpat_real_updateAction(msg)
}

var router

function getRpat(msg) {

    document.getElementById("rpat_real_rp").value = msg;
}

function rpat_real_preparePrefixes(data) {

    var list = document.getElementById('rpeat_real_prefix_list');

    var s = new Set()
    for(a of data) 
	s.add(a.prefix+'/'+a.prefix_len)

    for(item of s) {
	var opt = document.createElement('option');
	opt.setAttribute('label', item);
	opt.setAttribute('value', item);
	list.appendChild(opt)
    }
}

function rpat_real_extractPrefixes() {

    var initTime = new Date(document.getElementById("rpat_real_init").value).valueOf()
    var toTime = new Date(document.getElementById("rpat_real_to").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(initTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(toTime)

    console.log(tmpDate, tmpDate2)
    druidReq = {
	queryType: 'scan',
	dataSource: 'route_policy',
	columns: [
	    "prefix",
	    "prefix_len",
	],
 	rcvr: 'ctrlResp',
 	callbackFunc: rpat_real_preparePrefixes
     }
    druidReq.intervals =  [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],

    sendDruidRequest(druidReq)
}

function rpat_real_confirm() {

    var ipaddr
    var e = document.getElementById("rpat_real_prefix_list")
    ipaddr = e.options[e.selectedIndex].value

    var initTime = new Date(document.getElementById("rpat_real_init").value).valueOf()
    var fromTime = new Date(document.getElementById("rpat_real_from").value).valueOf()
    var toTime = new Date(document.getElementById("rpat_real_to").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(initTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(fromTime)

    var prefix_mask = ipaddr.split("/")


    var filters = []
    
    var invFilter = {"type": "selector", "dimension": "policy_name", "value": ""}
    var deny = {"type": "not", "field": invFilter}
    filters.push(deny)

    invFilter = {"type": "selector", "dimension": "peer_ip", "value": "192.0.2.154"}
    deny = {"type": "not", "field": invFilter}
    filters.push(deny)
    
    filters.push({"type": "regex", "dimension": "prefix", "pattern": prefix_mask[0]})
    filters.push({"type": "regex", "dimension": "prefix_len", "pattern": prefix_mask[1]})

    filters.push({"type": "regex", "dimension": "bmp_router", "pattern": "(192.0.2.61)|(192.0.2.62)|(192.0.2.53)"})
    
    //add column filter and negative match (with 127.0.0.1 and ::1)
    var filter = { "type": "and", "fields": filters}
    druidReq = {
	queryType: 'scan',
	dataSource: 'route_policy',
	columns: [
	    "__time",
	    "bmp_router",
	    "rd",
	    "prefix",
	    "prefix_len",
	    "peer_ip",
	    "policy_name",
	    "policy_class",
	    "policy_is_match",
	    "policy_is_permit",
	    "policy_is_diff"
	],
	filter: filter,

 	rcvr: 'ctrlResp',
 	callbackFunc: rpat_real_resp
     }
    druidReq.intervals =  [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],

    sendDruidRequest(druidReq)
}


function rpat_real_forward() {
    if(num >= stepData.length) {
	console.log("End of data")
	return
    }

    while(num < stepData.length) {
	var msg = stepData[num++]
	if(rpat_real_msgFilter(msg,filter)) {
	    rpat_real_changeGraph(msg)
	    console.log(msg)
	    document.getElementById("rpat_real_cm").value = JSON.stringify(msg,null,2);
	    draw_ctrl()
	    break;
	}
    }
}

function rpat_real_fastForward() {

    if(num >= stepData.length) {
	console.log("End of data")
	return
    }

    var count = 0
    while(num < stepData.length && count < 5) {

	var msg = stepData[num++]
	if(rpat_real_msgFilter(msg,filter)) {
	    rpat_real_changeGraph(msg)
	    count++
	    draw_ctrl()
	}
    }

}


function rpat_real_updateAction(msg) {

    console.log(msg)
    var src = getNode({id: msg.bmp_router})
    if(src == undefined)
	src = setNode(
	    {
		id: msg.bmp_router,
		label: msg.bmp_router
	    }
	)

    var targ = getNode({id: msg.peer_ip+msg.policy_name})
    if(targ == undefined) 
    	targ = setNode(
	    {
		id: msg.peer_ip+msg.policy_name,
		label: msg.policy_name,
		info: "Policy Class: "+msg.policy_class+"\n"+
		    "Match: "+msg.policy_is_match+"\n"+
		    "Permit: "+msg.policy_is_permit+"\n"+
		    "Diff: "+msg.policy_is_diff+"\n",
		labelCallback: function clickCallback(d) {
		    sendRpatRequest({
		    	name: "xmlns:rtp=\"urn:huawei:yang:huawei-routing-policy\" select=\"/rtp:routing-policy/rtp:policy-definitions/rtp:policy-definition[rtp:name='RP-A20-IP-OUT']/rtp:nodes/rtp:node[rtp:sequence='10']",
		    	callbackFunc: getRpat
		    })		    
		    document.getElementById("rpat_real_additional").value = d.info
		}
	    }
	)

    setEdge(
	{
	    source: src,
	    target: targ,
	    replace: [
		{ field: 'label', value: msg.peer_ip },
		{ field: 'status', value: 'update' }
	    ],
	    append: []
	}
    )
}


function rpat_real_msgFilter(msg, filter) {
    for(f of filter) {
	f.data.msg = msg
   	if(! f.func(f.data))
   	    return false;
    }
    return true
}

