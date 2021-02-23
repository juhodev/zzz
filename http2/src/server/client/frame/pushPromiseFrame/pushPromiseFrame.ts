import Flags from '../flags';
import Frame from '../frame';
import { FrameType } from '../types';
import { PushPromiseFrameFlags } from './types';

class PushPromiseFrame {
	private frame: Frame;

	read(frame: Frame) {}

	create(promisedStreamIdentifier: number, headerBlock: Buffer, flags: Flags, streamIdentifier: number): Frame {
		let paddingReserved: number = 0;
		if (flags.has(PushPromiseFrameFlags.PADDED)) {
			paddingReserved += 4;
		}

		let payload: Buffer = Buffer.alloc(paddingReserved + 4);
		let position: number = 0;

		if (flags.has(PushPromiseFrameFlags.PADDED)) {
			payload.writeUInt8(flags.get(PushPromiseFrameFlags.PADDED), position);
		}

		payload.writeUInt32BE(promisedStreamIdentifier);
		payload = Buffer.concat([payload, headerBlock]);

		if (flags.has(PushPromiseFrameFlags.PADDED)) {
			payload = Buffer.concat([payload, Buffer.alloc(flags.get(PushPromiseFrameFlags.PADDED)).fill(0x0)]);
		}

		const frame: Frame = new Frame();
		frame.create(FrameType.PUSH_PROMISE, flags.toNumber(), streamIdentifier, payload);
		return frame;
	}
}

export default PushPromiseFrame;
