var BYTES_PER_MB = 1000
//Druid datasource where IPFIX data resides, e.g., nfacctd_ipfix
var ipfixDatasource

var dataPlaneGraph = []

function add_marker(time) {
    if(dataPlaneGraph[0] == undefined) return

    dataPlane2 = {name: "marker",
    		  values:
    		  [
    		      {date: new Date(time), value: 0},
		      //y-axis height depending on the data
    		      {date: new Date(time), value:  d3.max(dataPlaneGraph[0].values, function (d) {
			  return d.value; })+d3.max(dataPlaneGraph[0].values, function (d) {
			   return d.value; })*0.2}
    		  ]
    		 }
    dataPlaneGraph[1] = (dataPlane2)
    draw_data()
}

function data_resp(data) {

    var dataPlane = []
    var count = 0
    var m = {}
    for(msg of data) {
	if(m[""+msg["__time"]] == undefined) {
	    m[""+msg["__time"]] = msg["bytes"]/BYTES_PER_MB
	}  else {
	    m[""+msg["__time"]] += msg["bytes"]/BYTES_PER_MB
	}
    }

    var sortedArr = []
    for(var k in m) {
	sortedArr.push([k, m[k]])

    }
	
    sortedArr.sort(function compare(kv1, kv2) {
	return kv1[0] - kv2[0]
    })

    for(var k of sortedArr) {
	dataPlane.push({date: parseInt(k[0]), value: k[1]})
    }

    dataPlaneGraph.push({name: "ipfix", values: dataPlane})
    draw_data()
}

function data_confirm() {
    var stdcomm, peer

    var e = document.getElementById("data_stdcomm")
    stdcomm = e.options[e.selectedIndex].value

    e = document.getElementById("data_peer")
    peer = e.options[e.selectedIndex].value

    var fromTime = new Date(document.getElementById("data_from").value).valueOf()
    var toTime = new Date(document.getElementById("data_to").value).valueOf()

    var tmpDate = new Date(0)
    tmpDate.setUTCMilliseconds(fromTime)
    
    var tmpDate2 = new Date(0)
    tmpDate2.setUTCMilliseconds(toTime)

    var filters = []
    filters.push({"type": "regex", "dimension": "comms", "pattern": stdcomm})

    if(peer !== "all")
    	filters.push({"type": "regex", "dimension": "peer_ip_src", "pattern": peer})
    
    var filter = { "type": "and", "fields": filters}
    sendDruidRequest({
	queryType: 'scan',
	dataSource: ipfixDatasource,
	columns: [
	    "__time",
	    "comms",
	    "bytes",
	    "peer_ip_src"
	],
	filter: filter,
	intervals: [tmpDate.toISOString()+'/'+tmpDate2.toISOString()],
	rcvr: 'dataResp',
	callbackFunc: data_resp,
    })
}
