/**
* ported from AS,
* not finished at all
**/
class Packet {

		static get PRIORITY_HIGH() {return 0xF8};
		static get PRIORITY_LOW() {return 0xFB};


    /// Maximum packet size used by the Velbus protocol.
    public static const MAX_PACKET_SIZE:int = 14;

    /// Start of packet.
    public static const STX:int = 0x0F;

    /// End of packet.
    public static const ETX:int = 0x04;

/// Raw representation of this packet.
    private var _rawPacket:ByteArray = new ByteArray();

		/**
		 * Initializes a new instance of the Packet class using the specified address.
		 * @param	address_
		 */
		public function Packet(address_:int, packetPriority_:int = Packet.PRIORITY_HIGH, dataSize_:int = MAX_PACKET_SIZE, dataBytes_:ByteArray = null, rtr_:Boolean = false)
		{
			_rawPacket = new ByteArray();
			//for (var i:int = 0; i < MAX_PACKET_SIZE; i++)
			//{
				//_rawPacket.writeByte(0x00);
			//}
			address = address_;
			priority = packetPriority_;
			rtr = rtr_;
			dataSize = dataSize_;
			if (dataBytes_) {
				setDataBytes(dataBytes_);
			}
			Pack();
		}



        /// Gets or sets the address of the packet.
        public function get address():int {
			return _rawPacket[2];
		}

		public function set address(value:int):void
		{
			if ((value < 0) || (value > 0xFF))
			{
				new Error("Valid address range between 0 and 255.");
			}
			_rawPacket[2] = value;

		}


        /// Gets or sets the datasize of the packet. - Do not to be mistaken with size!
        public function get dataSize():int {
			//trace( ">get dataSize : " + (_rawPacket[3] & 0x0F) % 256);
			return (_rawPacket[3] & 0x0F) % 256;
		}

		public function set dataSize(value:int):void {
			if ((value < 0) || (value > 8))
			{
				new Error("Invalid datasize. Value must range between 0 and 8.");
			}
			var orig:int = _rawPacket[3];
			_rawPacket[3] = ((orig & 0xF0) + value) % 256;
		}

		/// Gets the total size of the packet in its raw form.
        public function get size():int {
            return (dataSize + 6);
        }

        /// Gets or sets the priority of the packet.
        public function get priority():int {
			return (_rawPacket[1]);
        }

		public function set priority(value:int):void {
            _rawPacket[1] = value;
        }

        /// Gets or sets the request to reply state of the packet.

		public function set rtr(value:Boolean):void {
			var tmp:int = _rawPacket[3];
			if (value) {
				_rawPacket[3] = (tmp | 0x40);
			} else {
				_rawPacket[3] = (tmp | 0x0F);
			}
        }

		public function get rtr():Boolean {
			return ((_rawPacket[3] & 0x40) == 0x40);
        }

        /// Gets the databyte at the specified position idx.
        public function getDataByte(idx:int):int {
            return _rawPacket[4 + idx];
		}

		//sets the databyte at the specified position idx.
		public function setDataByte(idx:int, value:int):void {
			_rawPacket[4 + idx] = value;
        }

		public function setDataBytes(ba:ByteArray):Packet {
			for (var i:int = 0; i < ba.length; i++) {
				setDataByte(i, ba[i]);
			}
			dataSize = ba.length;
            return this;
        }

		//sets the  raw byte at the specified position idx.
		public function setRawByte(idx:int, value:int):void {

            _rawPacket[idx] = (value);
        }

		public function setRawBytes(ba:ByteArray):Packet {
			for (var i:int = 0; i < ba.length; i++) {
				setRawByte(i, ba[i]);
			}
            return this;
        }

		public function setRawBytesAndPack(ba:ByteArray):Packet {
			for (var i:int = 0; i < ba.length; i++) {
				setRawByte(i, ba[i]);
			}
            Pack();
			return this;
        }

        /**
         * Gets or sets the command byte of the packet. Since the command
		 * byte is the first databyte, the datasize needs to be greater or equal to one.
         */
        public function get command():int {
			if (dataSize <= 0) {
				new Error("Packet does not contain a command byte.");
			}
			return getDataByte(0);
        }

        public function set command(value:int):void {
			if (dataSize <= 0) {
				new Error("Packet does not contain a command byte.");
			}
			setDataByte(0,value);
        }

        /// Checks if the packet has a command byte (eg. if DataSize >= 1).
        public function get hasCommand():Boolean {
            return (dataSize >= 1);
        }

		/**
		 * Packs the byte so it is ready for sending. Packing involves adding a checksum and the frame delimiters.
		 * Returns a raw representation of the packet.</returns>
		 */
        public function Pack():ByteArray {
			//if (command == 0) {
				//throw Error("No command present for Packet " + this);
			//}
			_rawPacket[0] = (Packet.STX);
			_rawPacket[size - 1] = (Packet.ETX);
			_rawPacket[size - 2] = (checksum_Crc8()); // size issue

            return _rawPacket;
        }

		/// Calculates the 2's complement checksum of a specified buffer.
        /// <param name="data">The buffer.</param>
        /// <param name="size">Size of the buffer.</param>
        /// <returns>Returns the 2's complement checksum.</returns>
		public function checksum_Crc8():int {
			var checksum:int = 0;
			for (var i:int = 0; i < size - 2; i++) {
				checksum += _rawPacket[i];
				//trace( "_rawPacket[" + i + "] : " + _rawPacket[i] );
				if (checksum > 255) {
					checksum = checksum - 256;
				}
			}
			checksum &= 0xff;
			checksum ^= 0xff;
			checksum += 0x01;
			return (checksum );
		}

        /// Clones this packet.
        public function Clone():Object
        {
            var packet:Packet = new Packet(address);
            for (var i:int = 0; i < size; i++) {
				packet.setDataByte(i, _rawPacket[i]);
			}
            return packet;
        }

		public override function toString():String {
			return "adress: " + dec2hex(address) + " - priority: " + dec2hex(priority) + " - rtr: " + rtr +
				" - dataSize: " + dec2hex(dataSize) + " - command: " + dec2hex(command) +
				" - checksum: " + dec2hex(checksum_Crc8()) + " - data: " + getDataBytesAsString() + " - raw: " + getRawDataAsString();
		}

		private function getRawDataAsString():String
		{
			var s:String = "";
			for (var i:int = 0; i < size; i++)
			{
				s += dec2hex(_rawPacket[i]) + " ";
			}
			return s;
		}

		private function getDataBytes():ByteArray
		{
			var ba:ByteArray = new ByteArray()
			for (var i:int = 0; i < dataSize; i++)
			{
				ba.writeByte(_rawPacket[i]);
			}
			return ba;
		}

		public function getDataBytesAsString():String
		{
			var s:String = "";
			for (var i:int = 0; i < dataSize; i++)
			{
				s += dec2hex(getDataByte(i) ) + " ";
			}
			return s;
		}

		public function getRawPacket():ByteArray
		{
			return _rawPacket;
		}

		public static function dec2hex( d:int ) : String {
		    //var c:Array = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' ];
		    //if( d> 255 ) d = d - 256;
		    //var l:int = d / 16;
		    //var r:int = d % 16;
		    //return c[l]+c[r];
			var s:String = d.toString(16).toUpperCase();
			if (s.length == 1) s = "0" + s
			return s
		}

	}

}
