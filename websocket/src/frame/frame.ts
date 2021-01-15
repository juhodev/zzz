import * as ByteBuffer from 'bytebuffer';
import { ClientType } from '../client/types';
import { FrameData, Opcode } from './types';
import * as crypto from 'crypto';
import { write } from 'fs';

class Frame {
	private byteBuffer: ByteBuffer;

	constructor(data?: Buffer) {
		if (data === undefined) {
			this.byteBuffer = new ByteBuffer();
		} else {
			this.byteBuffer = ByteBuffer.wrap(data);
		}
	}

	create(opcode: Opcode, payload: string, finBit: boolean, type: ClientType) {
		// FIN
		// RSV1
		// RSV2
		// RSV3
		let firstEight: number;
		if (finBit) {
			firstEight = 0b10000000;
		} else {
			firstEight = 0b00000000;
		}
		firstEight |= opcode;
		this.byteBuffer.writeUint8(firstEight);

		if (payload.length > 0 && payload.length <= 125) {
			let withMask: number = payload.length;
			if (type === ClientType.REAL_CLIENT) {
				withMask |= 0b10000000;
			}
			this.byteBuffer.writeInt8(withMask);
		} else if (payload.length > 125 && payload.length <= 65535) {
			let withMask: number = 126;
			if (type === ClientType.REAL_CLIENT) {
				withMask |= 0b10000000;
			}

			this.byteBuffer.writeInt8(withMask);
			this.byteBuffer.writeUint16(payload.length);
		} else {
			let withMask: number = 127;
			if (type === ClientType.REAL_CLIENT) {
				withMask |= 0b10000000;
			}

			this.byteBuffer.writeInt8(withMask);
			this.byteBuffer.writeUint32(payload.length);
		}

		if (type === ClientType.REAL_CLIENT) {
			const mask: Buffer = crypto.randomBytes(4);
			this.byteBuffer.append(mask);
			const payloadBuffer: Buffer = Buffer.alloc(payload.length);
			payloadBuffer.write(payload, 'utf-8');
			for (let i = 0; i < payloadBuffer.length; i++) {
				const decoded: number = payloadBuffer.readInt8(i);
				const maskBit: number = mask.readInt8(i % 4);
				const encoded: number = decoded ^ maskBit;
				this.byteBuffer.writeInt8(encoded);
			}
		} else {
			this.byteBuffer.writeString(payload);
		}
	}

	toBuffer() {
		const buffer: Buffer = Buffer.alloc(this.byteBuffer.offset);
		this.byteBuffer.buffer.copy(buffer, 0, 0, buffer.length);
		return buffer;
	}

	read(): FrameData {
		let POSITION: number = 0;

		const buffer: Buffer = this.byteBuffer.buffer;
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

		if (payloadLength > 125 && payloadLength <= 65535) {
			const nextTwo: Buffer = Buffer.alloc(2);
			buffer.copy(nextTwo, 0, POSITION, (POSITION += 2));
			payloadLength = nextTwo.readUInt16BE();
		} else if (payloadLength > 65535) {
			const nextFour: Buffer = Buffer.alloc(4);
			buffer.copy(nextFour, 0, POSITION, (POSITION += 4));
			payloadLength = nextFour.readUInt32BE();
		}

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
