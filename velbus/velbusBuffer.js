class VelbusBuffer {

	static get COMMAND_BUTTON() { return 0x00 };

	constructor (buffer) {
		this.priority = buffer[1];
		this.address = buffer[2];
		this.dataLength = buffer[3];
		this.data = new Array();
		for (var i = 0; i <  this.dataLength; i++) {
			this.data.push(buffer[4+i]);
		}
		if (this.dataLength > 0) {
			this.command = this.data[0];
		} else {
			this.command = null;
		}
		return this;
	}

	toString() {
		return "addr: " + this.address + ", data: " + this.data;
	}

}

module.exports = VelbusBuffer;
