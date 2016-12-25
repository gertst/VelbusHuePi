'use strict';

/**
 * Created by Gert on 12/11/2016.
 */

let axios = require('axios');


class Hue {

	constructor(userKey, onHueReady) {

		this.userKey = userKey;
		this.onHueReady = onHueReady;
		this.ip = null;

		this.getBridgeIp();



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
	/**
	 * Returns a groupState in a callback function
	 * Used in this.SwitchGroup
	 * @param groupId
	 * @param callback functions has params groupId and groupState.
	 * groupState is JSON like this:
	 * {"name":"Kitchen","lights":["3","4","5","6"],"type":"Room","state":{"all_on":false,"any_on":false},"class":"Kitchen","action":{"on":false,"bri":224,"ct":343,"alert":"select","colormode":"ct"}}
	 */
	getGroupState(groupId, callback) {
		const vhttp = require('http');

		//this.groupId = groupId;

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
				//console.log("groupState: " + body);
				callback(self.groupId, groupState);

			});
		}).end();
	}

	/**
	 * http://192.168.1.170/api/E5xHhc9ZROHP0aRT24Ka6CANmwsRG5C9Zb1p6PmT/lights/2/state
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

	switchGroup(groupId, callback) {
		this.getGroupState(groupId, (groupId, groupState) =>  {
			this.setGroupAction(groupId, {"on": !groupState.state.all_on});
			if (callback) {
				callback(groupState);
			}
		});
	}

}

module.exports = Hue;
