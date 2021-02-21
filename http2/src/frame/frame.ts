import * as ByteBuffer from 'bytebuffer';
import { dec2bin, isNil } from '../utilts';

class Frame {
	private byteBuffer: ByteBuffer;

	private length: number;
	private type: number;
	private flags: number;
	private streamIdentifier: number;
	private payload: Buffer;

	private readPosition: number = 0;

	constructor(byteBuffer?: ByteBuffer) {
		if (isNil(byteBuffer)) {
			this.byteBuffer = new ByteBuffer();
		} else {
			this.byteBuffer = byteBuffer;
		}

		this.readPosition = 0;
	}

	toBuffer(): Buffer {
		const buffer: Buffer = Buffer.alloc(this.byteBuffer.offset);
		this.byteBuffer.buffer.copy(buffer, 0, 0, this.byteBuffer.offset);
		return buffer;
	}

	protected create(length: number, type: number, flags: number, streamIdentifier: number) {
		// "Values greater than 2^14 (16,384) MUST NOT be sent unless the receiver
		// has set a larger value for SETTINGS_MAX_FRAME_SIZE"
		// I won't support it so just don't send the frame.
		if (length > Math.pow(2, 14)) {
			console.error('This does not support SETTINGS_MAX_FRAME_SIZE');
			return;
		}

		const lengthWithType: number = (length << 8) | type;

		this.byteBuffer.writeUint32(lengthWithType);
		this.byteBuffer.writeInt8(flags);
		this.byteBuffer.writeUint32(streamIdentifier);
	}

	read() {
		const buffer: Buffer = this.byteBuffer.buffer;

		const lengthAndTypeBuffer: Buffer = Buffer.alloc(4);
		buffer.copy(lengthAndTypeBuffer, 0, 0, 4);
		this.readPosition += 4;

		const lengthAndType: number = lengthAndTypeBuffer.readInt32BE();
		this.length = lengthAndType >> 8;
		this.type = lengthAndType & 0xff;

		this.flags = this.byteBuffer.readByte(this.readPosition++);

		this.streamIdentifier = this.byteBuffer.readInt32(this.readPosition);
		this.readPosition += 4;

		this.payload = Buffer.alloc(this.length);
		buffer.copy(this.payload, 0, this.readPosition, this.length);
	}

	getStreamIdentifier(): number {
		return this.streamIdentifier;
	}

	getType(): number {
		return this.type;
	}

	getPayloadLength(): number {
		return this.length;
	}

	getPayload(): Buffer {
		return this.payload;
	}

	getFlags(): number {
		return this.flags;
	}
}

export default Frame;
