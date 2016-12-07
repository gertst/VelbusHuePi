'use strict';

/**
 * Created by Gert on 12/11/2016.
 */

let axios = require('axios');
let SunCalc = require('suncalc');

class Hue {

	constructor(userKey, onHueReady) {

		this.userKey = userKey;
		this.onHueReady = onHueReady;
		this.ip = null;

		this.getBridgeIp();

		var times = SunCalc.getTimes(new Date(), 51.5, -0.1);
		console.log(times);

	}



	getBridgeIp() {
		const vhttp = require('https');

		var options = {
			hostname: 'www.meethue.com',
			//port: 80,
			path: '/api/nupnp',
			method: 'GET'
		};

		var self = this;

		vhttp.request(options, function (res) {
			res.on('data', function (chunk) {

				//console.log(" :: " + chunk);
				if (chunk != "[]") {
					self.ip = JSON.parse(chunk)[0].internalipaddress;
				} else {
					console.log("ERROR: No Hue bridge found...");
					self.ip = "";
				}
				//console.log(callback)
				self.onHueReady(self.ip);
			});
		}).end();
	}

	///api/E5xHhc9ZROHP0aRT24Ka6CANmwsRG5C9Zb1p6PmT/groups/2
	getGroupState(groupId) {
		const vhttp = require('http');

		this.groupId = groupId;

		var options = {
			hostname: this.ip,
			port: 80,
			path: '/api/' + this.userKey + "/groups/" + groupId,
			method: 'GET'
		};

		var self = this;

		vhttp.request(options, function (res) {
			var body = [];
			res.on('data', function(chunk) {
			  body.push(chunk);
			}).on('end', function() {
			  body = Buffer.concat(body).toString();
			  // at this point, `body` has the entire request body stored in it as a string
				//console.log(body);
				let groupState = JSON.parse(body);
				console.log("all on: " + groupState.state.all_on);
				console.log("bri: " + groupState.action.bri);
				console.log("ct: " + groupState.action.ct);
				//switch state
				self.setGroupAction(self.groupId, {"on": !groupState.state.all_on});

			});
		}).end();
	}

	/**
	 * http://192.168.0.170/api/E5xHhc9ZROHP0aRT24Ka6CANmwsRG5C9Zb1p6PmT/lights/2/state
	 * @param lightId
	 */
	setLightAction(lightId, state) {
		const vhttp = require('http');

		var data = {"on": state};

		var options = {
			hostname: this.ip,
			path: '/api/' + this.userKey + "/lights/" + lightId + "/state",
			method: 'PUT'
		};
		console.log(options.path);

		vhttp.request(options, function (res) {
			res.on('data', function (chunk) {
				console.log("response: " + chunk);
			});

		}).end(JSON.stringify(data));
	}

	setGroupAction(groupId, actionJson) {

		const vhttp = require('http');

		var options = {
			hostname: this.ip,
			path: '/api/' + this.userKey + "/groups/" + groupId + "/action",
			method: 'PUT'
		};
		console.log(options.path);

		vhttp.request(options, function (res) {
			res.on('data', function (chunk) {
				console.log("response: " + chunk);
			});

		}).end(JSON.stringify(actionJson));
	}

	switchGroup(groupId) {
		this.getGroupState(groupId);
	}

}

module.exports = Hue;
