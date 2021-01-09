import * as ByteBuffer from 'bytebuffer';
import { Opcode } from './types';

class Frame {
	private byteBuffer: ByteBuffer;

	constructor() {
		this.byteBuffer = new ByteBuffer();
	}

	create(opcode: Opcode, payload: string) {
		// FIN
		this.byteBuffer.writeByte(1);

		// RSV1
		this.byteBuffer.writeByte(0);

		// RSV2
		this.byteBuffer.writeByte(0);

		// RSV3
		this.byteBuffer.writeByte(0);

		// Opcode
		const testOpcode: Buffer = Buffer.alloc(4);
		testOpcode.writeUInt32LE(0x1);

		this.byteBuffer.append(testOpcode);

		// Mask
		this.byteBuffer.writeByte(0);

		// Payload length
		if (payload.length > 0 && payload.length <= 125) {
			// if the payload length it less than 125 then I can just write
			// it here and I'm done
			this.byteBuffer.writeUint8(payload.length);
		} else if (payload.length > 125 && payload.length <= 65535) {
			this.byteBuffer.writeUint8(126);
			// The above number is bitshifted by one so write over the last
			// zero bit
			this.byteBuffer.writeUint16(payload.length, this.byteBuffer.offset - 1);
		} else {
			this.byteBuffer.writeUint8(127);
			this.byteBuffer.writeUint64(payload.length, this.byteBuffer.offset - 1);
		}

		// Masking-key
		// There is no masking-key when sending from server to client

		// Payload data
		// For now, there will not be any extension data

		// Application data
		this.byteBuffer.writeString(payload);
	}

	toBuffer() {
		const buffer: Buffer = Buffer.alloc(this.byteBuffer.offset);
		this.byteBuffer.buffer.copy(buffer, 0, 0, buffer.length);
		return buffer;
	}
}

export default Frame;
