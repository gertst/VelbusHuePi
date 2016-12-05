'use strict';

let Hue = require("./hue.js");
let Velbus = require("./velbus/velbus.js");

var hue = new Hue("fudfN2qQHAORBkb46hMxen13dK5ixHmpCt6vPRaS", function(ip){
	console.log("ip::" + ip);
	hue.switchGroup(2);
});



let velbus = new Velbus('/dev/ttyACM0');

velbus.emitter.on(Velbus.EVT_BUTTON_PRESSED, function(buffer) {
	console.log("btn pressed " + buffer.toString());

	//alles uit trap
	if (buffer.address == 0x12 && buffer.data[1] == 0x01) {
		hue.setGroupAction(1, {
			"on": false,
			// "transitiontime": 250
		});
		hue.setGroupAction(2, {
			"on": false,
			// "transitiontime": 50
		});
	}

	//alles uit vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x01) {
		hue.setGroupAction(1, {
			"on": false,
			// "transitiontime": 250
		});
		hue.setGroupAction(2, {
			"on": false,
			// "transitiontime": 50
		});
	}

	//keukenlamp aan trap
	if (buffer.address == 0x12 && buffer.data[1] == 0x02) {
		hue.setGroupAction(1, {
			"on": true,
			// "transitiontime": 10
		});
	}
	//keukenlamp aan vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x02) {
		hue.setGroupAction(1, {
			"on": true,
			// "transitiontime": 10
		});
		hue.setGroupAction(2, {
			"on": true,
			// "transitiontime": 10
		});
	}
	//sfeer aan vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x08) {
		hue.setGroupAction(1, {
			"on": false,
			// "transitiontime": 10
		});
		hue.setGroupAction(2, {
			"on": false,
			// "transitiontime": 10
		});
	}

	//sfeer aan vestiaire
	if (buffer.address == 0x11 && buffer.data[1] == 0x08) {
		hue.setGroupAction(1, {
			"on": false,
			// "transitiontime": 10
		});
		hue.setGroupAction(2, {
			"on": false,
			// "transitiontime": 10
		});
	}
	//sfeer aan trap
	if (buffer.address == 0x12 && buffer.data[1] == 0x10) {
		hue.setGroupAction(1, {
			"on": false,
			// "transitiontime": 10
		});
		hue.setGroupAction(2, {
			"on": false,
			// "transitiontime": 10
		});
	}

})
