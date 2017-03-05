'use strict';

var https = require('https');
var express = require('express');
var fs = require('fs');

var privateKey = fs.readFileSync('key.pem');
var certificate = fs.readFileSync('cert.pem');

var credentials = {key: privateKey, cert: certificate};

var app = express();
//var app = express();
https.createServer(credentials, app).listen(3000);

//<Buffer 0f f8 01 04 0f 01 01 00 e3 04>
const bufAllesUit = Buffer.from('0ff8120400010000e204', 'hex');
const buffKeukenOn = Buffer.from("0ff8110400002000c404", "hex");
const buffKeukenOff = Buffer.from("0ff801040f012300c104", "hex");
const buffSfeer = Buffer.from("0f8000000f30", "hex");


app.get('/velbus/:key/:command', function (req, res) {
	res.send(req.params);
	console.log("get ", req.params);
	if (req.params.key == "keuken") {

		// port.on("open", function () {
		// 	console.log("on open::");
		if (req.params.command == "on") {
			velbus.command(buffKeukenOn);
		} else {
			velbus.command(buffKeukenOff);
		}

	} else if (req.params.key == "keuken") {
		velbus.command(buffSfeer);
	} else if (req.params.key == "allOff") {
		velbus.command(bufAllesUit);
	}  else if (req.params.key == "sfeer") {
		velbus.command(buffSfeer);
	} else if (req.params.key == "blink") {
		hue.switchGroup(1);
		hue.switchGroup(2);
		setTimeout(function() {
			hue.switchGroup(1);
			hue.switchGroup(2);
		}, 800);
	}
})

//https.listen(3000, function () {
//	console.log('Example app listening on port 3000!')
//})


let Hue = require("./hue.js");
let Velbus = require("./velbus/velbus.js");

let SunCalc = require('suncalc');
var times = SunCalc.getTimes(new Date(), 51.5, -0.1);
console.log(times);

var hue = new Hue("fudfN2qQHAORBkb46hMxen13dK5ixHmpCt6vPRaS", function(ip){
	console.log("ip::" + ip);
	//hue.switchGroup(2);
});



let velbus = new Velbus('/dev/ttyACM0');

velbus.emitter.on(Velbus.EVT_BUTTON_PRESSED, function(buffer) {
	console.log("btn pressed " + buffer.toString());

	//alles uit trap
	if (buffer.address == 0x12 && buffer.data[1] == 0x01) {
		console.log("alles uit trap");
		hue.setGroupAction(1, {"on": false});
		hue.setGroupAction(2, {"on": false});
	}

	//alles uit vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x01) {
		hue.setGroupAction(1, {"on": false});
		hue.setGroupAction(2, {"on": false});
	}

	//keukenlamp switch trap
	if (buffer.address == 0x12 && buffer.data[1] == 0x02) {
		hue.switchGroup(1);
		hue.switchGroup(2);
	}
	//keukenlamp aan vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x02) {
		hue.switchGroup(1);
	}
	//sfeer aan vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x08) {
		//hue.setGroupAction(1, {"on": false});
		//hue.setGroupAction(2, {"on": false});
	}

	//sfeer aan trap
	if (buffer.address == 0x12 && buffer.data[1] == 0x10) {
		//hue.setGroupAction(1, {"on": true});
		//hue.setGroupAction(2, {"on": false});
	}

});



