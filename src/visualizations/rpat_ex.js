var stepData = []
var num

function rpat_ex_resp_steps(data) {

    stepData = data
    num = 0
    var forwardBtn = document.getElementById("rpat_ex_forward");
    forwardBtn.disabled = ""
    var fastForwardBtn = document.getElementById("rpat_ex_fastForward");
    fastForwardBtn.disabled = ""
}

function rpat_ex_resp(data) {
    for(msg of data) {
	console.log(msg)
    	if(msgFilter(msg,filter)) {
    	    rpat_ex_changeGraph(msg)
    	}
    }
    draw_ctrl()

    fromTime = new Date(document.getElementById("rpat_ex_from").value).valueOf()
    toTime = new Date(document.getElementById("rpat_ex_to").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(toTime)

    druidReq.intervals = [tmpDate.toISOString()+'/'+tmpDate2.toISOString()]
    druidReq.rcvr = 'ctrlResp'
    druidReq.callbackFunc = rpat_ex_resp_steps

    sendDruidRequest(druidReq)
}

function rpat_ex_changeGraph(msg) {
    rpat_ex_updateAction(msg)
}

var router

function getRpat(msg) {

    document.getElementById("rpat_ex_rp").value = msg;
}

function rpat_ex_preparePrefixes(data) {

    var list = document.getElementById('rpat_ex_prefix_list');

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

function rpat_ex_extractPrefixes() {

    var initTime = new Date(document.getElementById("rpat_ex_init").value).valueOf()
    var toTime = new Date(document.getElementById("rpat_ex_to").value).valueOf()

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
 	callbackFunc: rpat_ex_preparePrefixes
     }
    druidReq.intervals =  [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],

    sendDruidRequest(druidReq)
}

function rpat_ex_confirm() {



    var ipaddr
    var e = document.getElementById("rpat_ex_prefix_list")
    ipaddr = e.options[e.selectedIndex].value

    var initTime = new Date(document.getElementById("rpat_ex_init").value).valueOf()
    var fromTime = new Date(document.getElementById("rpat_ex_from").value).valueOf()
    var toTime = new Date(document.getElementById("rpat_ex_to").value).valueOf()

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
 	callbackFunc: rpat_ex_resp
     }
    druidReq.intervals =  [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],

    sendDruidRequest(druidReq)
}


function rpat_ex_forward() {
    if(num >= stepData.length) {
	console.log("End of data")
	return
    }

    while(num < stepData.length) {
	var msg = stepData[num++]
	if(rpat_ex_msgFilter(msg,filter)) {
	    rpat_ex_changeGraph(msg)
	    console.log(msg)
	    document.getElementById("rpat_ex_cm").value = JSON.stringify(msg,null,2);
	    draw_ctrl()
	    break;
	}
    }
}

function rpat_ex_fastForward() {

    if(num >= stepData.length) {
	console.log("End of data")
	return
    }

    var count = 0
    while(num < stepData.length && count < 5) {

	var msg = stepData[num++]
	if(rpat_ex_msgFilter(msg,filter)) {
	    rpat_ex_changeGraph(msg)
	    count++
	    draw_ctrl()
	}
    }

}


function rpat_ex_updateAction(msg) {

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
		    document.getElementById("rpat_ex_additional").value = d.info
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


function rpat_ex_msgFilter(msg, filter) {
    for(f of filter) {
	f.data.msg = msg
   	if(! f.func(f.data))
   	    return false;
    }
    return true
}

