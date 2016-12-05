let EventEmitter = require('event-emitter-es6');
let SerialPort = require('serialport');
let VelbusBuffer = require('./velbusBuffer');

class Velbus  {

	static get EVT_BUTTON_PRESSED () {return "EVT_BUTTON_PRESSED"};

	constructor(serialPort) {
		let self = this;

		this.emitter = new EventEmitter();

		let port = new SerialPort(serialPort, {
			baudRate: 9600
		});


		// open errors will be emitted as an error event
		port.on('error', function (err) {
			console.log('Velbus: Serial ERROR :: ', err.message);
		})

		port.on('data', function (data) {
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
}


module.exports = Velbus;
