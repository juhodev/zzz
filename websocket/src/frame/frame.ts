import * as ByteBuffer from 'bytebuffer';
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
		// RSV1
		// RSV2
		// RSV3
		let firstEight: number = 0b10000000;
		firstEight |= opcode;

		let payloadLength: Buffer;
		if (payload.length > 0 && payload.length <= 125) {
			payloadLength = Buffer.alloc(1);
			payloadLength.writeUInt8(payload.length);
		} else if (payload.length > 125 && payload.length <= 65535) {
			payloadLength = Buffer.alloc(3);
			payloadLength.writeUInt8(126);
			payloadLength.writeUInt16LE(payload.length);
		} else {
			payloadLength = Buffer.alloc(5);
			payloadLength.writeUInt8(127);
			payloadLength.writeUInt32LE(payload.length);
		}

		this.byteBuffer.writeUint8(firstEight);
		this.byteBuffer.append(payloadLength);
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
		if (mask === 1) {
			for (let i = 0; i < applicationData.length; i++) {
				const encoded: number = applicationData.readInt8(i);
				const maskBit: number = maskBuffer.readInt8(i % 4);
				decoded += String.fromCharCode(encoded ^ maskBit);
			}
		} else {
			decoded = applicationData.toString();
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
