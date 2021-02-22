import { hasBitSet, isNil } from '../../utilts';
import Flags from '../flags';
import Frame from '../frame';
import { FrameType } from '../types';
import { DataFrameFlags } from './types';

class DataFrame {
	private frame: Frame;
	private readPosition: number;

	private data: Buffer;

	constructor() {
		this.readPosition = 0;
	}

	create(data: Buffer, streamIdentifier: number, flags: Flags): Frame {
		const frame: Frame = new Frame();
		frame.create(FrameType.DATA, flags.toNumber(), streamIdentifier, data);
		return frame;
	}

	read(frame: Frame) {
		this.frame = frame;
		this.readPosition = 0;

		if (this.frame.getStreamIdentifier() === 0) {
			// TODO: Response with a PROTOCOL_ERROR
			return;
		}

		// TODO: Check for stream state, must response with an error if not open or half-closed (local)

		const hasPadding: boolean = this.frame.hasFlag(DataFrameFlags.PADDED);
		let paddingLength: number = 0;

		if (hasPadding) {
			paddingLength = this.frame.getPayload().readInt8(this.readPosition++);

			if (paddingLength >= this.frame.getPayloadLength()) {
				// TODO: Response with PROTOCOL_ERROR
				return;
			}

			paddingLength += 1;
		}

		this.data = Buffer.alloc(this.frame.getPayloadLength() - paddingLength);
		this.frame.getPayload().copy(this.data, 0, this.readPosition, this.frame.getPayloadLength() - paddingLength);
		// this.data = this.byteBuffer.readBytes(this.length - paddingLength, this.readPosition).toBuffer();
	}

	getData(): Buffer | undefined {
		return this.data;
	}
}

export default DataFrame;
