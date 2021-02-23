import { dec2bin, hasBitSet, isNil } from '../../../utilts';

class Frame {
	private length: number;
	private type: number;
	private flags: number;
	private streamIdentifier: number;
	private payload: Buffer;

	private readPosition: number;

	private buffer: Buffer;

	constructor() {}

	toBuffer(): Buffer {
		return this.buffer;
	}

	create(type: number, flags: number, streamIdentifier: number, payload: Buffer) {
		this.type = type;
		this.flags = flags;
		this.streamIdentifier = streamIdentifier;
		this.payload = payload;
		this.length = payload.length;

		const length: number = payload.length;
		// "Values greater than 2^14 (16,384) MUST NOT be sent unless the receiver
		// has set a larger value for SETTINGS_MAX_FRAME_SIZE"
		// I won't support it so just don't send the frame.
		if (length > Math.pow(2, 14)) {
			console.error('This does not support SETTINGS_MAX_FRAME_SIZE');
			return;
		}

		this.buffer = Buffer.alloc(9);

		let position: number = 0;

		const lengthWithType: number = (length << 8) | type;
		this.buffer.writeUInt32BE(lengthWithType, position);
		position += 4;
		this.buffer.writeUInt8(flags, position++);
		this.buffer.writeUInt32BE(streamIdentifier, position);
		position += 4;
		this.buffer = Buffer.concat([this.buffer, payload]);
	}

	read(buffer: Buffer) {
		this.buffer = buffer;
		this.readPosition = 0;

		const lengthAndType: number = this.buffer.readUInt32BE(this.readPosition);
		this.readPosition += 4;

		this.length = lengthAndType >> 8;
		this.type = lengthAndType & 0xff;

		this.flags = this.buffer.readUInt8(this.readPosition++);

		this.streamIdentifier = this.buffer.readUInt32BE(this.readPosition);
		this.readPosition += 4;

		this.payload = this.buffer.slice(this.readPosition);
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

	hasFlag(flag: number): boolean {
		return hasBitSet(this.flags, flag);
	}
}

export default Frame;
