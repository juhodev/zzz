import * as ByteBuffer from 'bytebuffer';
import { isNil } from '../utilts';

class Frame {
	protected byteBuffer: ByteBuffer;

	protected length: number;
	protected type: number;
	protected flags: number;
	protected streamIdentifier: number;
	protected payload: Buffer;

	protected readPosition: number = 0;

	constructor(byteBuffer?: ByteBuffer) {
		if (isNil(byteBuffer)) {
			this.byteBuffer = new ByteBuffer();
		} else {
			this.byteBuffer = byteBuffer;
		}

		this.readPosition = 0;
	}

	create(length: number, type: number, flags: number, streamIdentifier: number) {
		// "Values greater than 2^14 (16,384) MUST NOT be sent unless the receiver
		// has set a larger value for SETTINGS_MAX_FRAME_SIZE"
		// I won't support it so just don't send the frame.
		if (length > Math.pow(2, 14)) {
			console.error('This does not support SETTINGS_MAX_FRAME_SIZE');
			return;
		}

		const lengthWithType: number = (length << 8) | type;
		this.byteBuffer.writeInt32(lengthWithType);
		this.byteBuffer.writeInt8(flags);
		this.byteBuffer.writeUint32(streamIdentifier);
	}

	read() {
		const lengthBuffer: ByteBuffer = this.byteBuffer.readBytes(3, this.readPosition);
		this.readPosition += 3;

		this.length = lengthBuffer.readUint32();
		this.type = this.byteBuffer.readByte(this.readPosition++);
		this.flags = this.byteBuffer.readByte(this.readPosition++);

		this.streamIdentifier = this.byteBuffer.readInt32(this.readPosition);
		this.readPosition += 4;
	}
}

export default Frame;
