import * as ByteBuffer from 'bytebuffer';
import { exception } from 'console';
import { decode, encode } from 'punycode';
import { FrameData, Opcode } from './types';

class Frame {
	private byteBuffer: ByteBuffer;

	constructor(data?: Buffer) {
		if (data === undefined) {
			this.byteBuffer = new ByteBuffer();
		} else {
			this.byteBuffer = ByteBuffer.wrap(data);
		}
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

	read(): FrameData {
		let POSITION: number = 0;

		const buffer: Buffer = this.byteBuffer.buffer;
		// const temp: Buffer = Buffer.alloc(8);
		// buffer.copy(temp, 0, 0, 8);
		// const tempNum: bigint = temp.readBigUInt64LE();
		// console.log(tempNum.toString(2));

		const first: Buffer = Buffer.alloc(1);
		buffer.copy(first, 0, 0, 1);
		const fin: number = this.bitSet(first, 0b10000000) ? 1 : 0;
		const rsv1: number = this.bitSet(first, 0b01000000) ? 1 : 0;
		const rsv2: number = this.bitSet(first, 0b00100000) ? 1 : 0;
		const rsv3: number = this.bitSet(first, 0b00010000) ? 1 : 0;

		let firstEight: number = buffer.readUInt8();
		firstEight &= ~0b11110000;
		const opcode: number = firstEight;
		POSITION++;

		const second: Buffer = Buffer.alloc(1);
		buffer.copy(second, 0, 1, 2);
		const mask: number = this.bitSet(second, 0b10000000) ? 1 : 0;

		let payloadLength: number = second.readUInt8();
		payloadLength &= ~0b10000000;
		POSITION++;

		let maskingKey: number;
		let maskBuffer: Buffer;
		if (mask === 1) {
			maskBuffer = Buffer.alloc(4);
			buffer.copy(maskBuffer, 0, POSITION, (POSITION += 4));
			maskingKey = maskBuffer.readInt32BE(0);
		} else {
			maskingKey = -1;
		}

		const applicationData: Buffer = Buffer.alloc(payloadLength);
		buffer.copy(applicationData, 0, POSITION, (POSITION += payloadLength));

		let decoded: string = '';
		for (let i = 0; i < applicationData.length; i++) {
			const encoded: number = applicationData.readInt8(i);
			const maskBit: number = maskBuffer.readInt8(i % 4);
			decoded += String.fromCharCode(encoded ^ maskBit);
		}
		return {
			FIN: fin,
			RSV1: rsv1,
			RSV2: rsv2,
			RSV3: rsv3,
			opcode,
			mask,
			maskingKey,
			payloadLength,
			applicationData: decoded,
		};
	}

	bitSet(buffer: Buffer, flag: number) {
		const num: number = buffer.readInt8(0);

		return (num & flag) === flag;
	}
}

export default Frame;
