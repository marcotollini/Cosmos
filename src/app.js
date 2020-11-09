var netconf = require('node-netconf');
var util = require('util');
var fs = require('fs');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var request = require('request');

//Specify Druid endpoint, e.g., http://localhost:8888/druid/v2/?pretty
var druidEndpoint

//Specify config if desirable to query route policies directly from router
var router = new netconf.Client({
    host: '',
    username: '',
    password: '',
    port: ''
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});


app.get('/visualizations/peer_ex.html', (req, res) => {
    res.sendFile(__dirname + '/visualizations/peer_ex.html');
});
app.get('/visualizations/peer_ex.js', (req, res) => {
    res.sendFile(__dirname + '/visualizations/peer_ex.js');
});

app.get('/visualizations/peer_real.html', (req, res) => {
    res.sendFile(__dirname + '/visualizations/peer_real.html');
});
app.get('/visualizations/peer_real.js', (req, res) => {
    res.sendFile(__dirname + '/visualizations/peer_real.js');
});


app.get('/visualizations/rm_real.html', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rm_real.html');
});
app.get('/visualizations/rm_real.js', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rm_real.js');
});

app.get('/visualizations/rm_ex.html', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rm_ex.html');
});
app.get('/visualizations/rm_ex.js', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rm_ex.js');
});


app.get('/visualizations/rpat_ex.html', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rpat_ex.html');
});
app.get('/visualizations/rpat_ex.js', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rpat_ex.js');
});

app.get('/visualizations/rpat_real.html', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rpat_real.html');
});
app.get('/visualizations/rpat_real.js', (req, res) => {
    res.sendFile(__dirname + '/visualizations/rpat_real.js');
});


app.get('/UI.js', (req, res) => {
    res.sendFile(__dirname + '/UI.js');
});

app.get('/Graph.js', (req, res) => {
    res.sendFile(__dirname + '/Graph.js');
});


app.get('/connector.js', (req, res) => {
    res.sendFile(__dirname + '/connector.js');
});

app.get('/data_plane.js', (req, res) => {
    res.sendFile(__dirname + '/data_plane.js');
});

var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

var druidReq = {
    queryType: 'scan',
    dataSource: 'route_monitor',
    columns: [],
    intervals:[],
    limit: 100000
}

var options = {
    url: druidEndpoint,
    method: 'POST',
    headers: headers,
    body: ''
};

function queryData(socket,reqObj) {

    options.body = JSON.stringify(reqObj)
    var json
    var ret = []
    request(options, function(error, response, body) {
    	if (!error) {
    	    var json = JSON.parse(body)
	    console.log(json)
    	    for(elem of json) {
    	    	for(item of elem["events"]) {
    	    	    ret.push(item)
    	    	}
    	    }
	    socket.emit(reqObj.rcvr, ret)		    	    
    	}
	return
    })
}

io.on('connection', (socket) => {
    socket.on('request', (reqObj) => {
	queryData(socket,reqObj)
    })

    socket.on('rpatReq', (rpatReqObj) => {

	queryRpat(socket, rpatReqObj.name)
    })
});

http.listen(8080, () => {
    console.log('listening on *:8080');
});

router.parseOpts.ignoreAttrs = false;
router.raw = true;

function queryRpat(socket,rpat) {

    router.open(function afterOpen(err) {
	if (!err) {
	    router.rpc(
		{
		    'get': {
			filter: {
			    $: 
			    {
				//Specify informations of interest, e.g., type, xmlns, select
			    }
			}
		    }
		}, function (err, results) {
		    router.close();
		    if (err) {
			throw (err);
		    }
		    socket.emit('rpatResp', results.raw)		    	    

		});
	} else {
	    throw err;
	}
    },)
}




