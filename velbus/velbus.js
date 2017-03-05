let EventEmitter = require('event-emitter-es6');
let SerialPort = require('serialport');
let VelbusBuffer = require('./velbusBuffer');

class Velbus  {

	static get EVT_BUTTON_PRESSED () {return "EVT_BUTTON_PRESSED"};


	//public port;

	constructor(serialPort) {
		let self = this;

		this.emitter = new EventEmitter();

		this.port = new SerialPort(serialPort, {
			baudRate: 9600
		});


		// open errors will be emitted as an error event
		this.port.on('error', function (err) {
			console.log('Velbus: Serial ERROR :: ', err.message);
		})

		this.port.on('data', function (data) {
			console.log(data); //
			let buffer = new VelbusBuffer(data);

			//btn pressed?
			if (buffer.command == VelbusBuffer.COMMAND_BUTTON) {
				console.log("btn " + buffer.address); //
				self.emitter.emit(Velbus.EVT_BUTTON_PRESSED, buffer);
			}
		});

		// const bufAllesUit = Buffer.from('0ff8120400010000e204', 'hex');
		// port.on("open", function () {
		// 	console.log("on open::");
		// 	port.write(bufAllesUit);
		// });
	}

	command(hexBuffer) {
		//console.log("command: " + hexBuffer);
		this.port.write(hexBuffer);
	}
}


module.exports = Velbus;
