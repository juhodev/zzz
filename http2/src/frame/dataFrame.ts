import { isNil } from '../utilts';
import Frame from './frame';
import { DataFrameFlags, FrameType } from './types';

class DataFrame extends Frame {
	private data: Buffer;

	constructor() {
		super();
	}

	createDataFrame(length: number, data: Buffer, streamIdentifier: number, paddingAmount?: number) {
		let flags: number = 0;
		if (!isNil(paddingAmount)) {
			flags = DataFrameFlags.PADDED;
		}

		super.create(length, FrameType.DATA, flags, streamIdentifier);

		if (!isNil(paddingAmount)) {
			super.byteBuffer.writeInt32(paddingAmount);
		}

		super.byteBuffer.append(data);

		if (!isNil(paddingAmount)) {
			super.byteBuffer.append(Buffer.alloc(paddingAmount).fill(0x0));
		}
	}

	read() {
		super.read();

		if (super.streamIdentifier === 0) {
			// TODO: Response with a PROTOCOL_ERROR
			return;
		}

		// TODO: Check for stream state, must response with an error if not open or half-closed (local)

		const hasPadding: boolean = super.flags === DataFrameFlags.PADDED;
		let paddingLength: number = 0;

		if (hasPadding) {
			paddingLength = super.byteBuffer.readInt8(super.readPosition++);

			if (paddingLength >= super.length) {
				// TODO: Response with PROTOCOL_ERROR
				return;
			}

			paddingLength += 8;
		}

		this.data = super.byteBuffer.readBytes(super.length - paddingLength, super.readPosition).toBuffer();
	}
}
