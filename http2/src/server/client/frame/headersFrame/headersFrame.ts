import * as ByteBuffer from 'bytebuffer';
import { hasBitSet } from '../../../../utilts';
import Flags from '../flags';
import Frame from '../frame';
import { FrameType } from '../types';
import { HeadersFrameFlags } from './types';
import * as HPACK from 'hpack';

class HeadersFrame {
	private frame: Frame;
	private readPosition: number;

	private headers: Map<string, string>;
	private weight: number;
	private streamDependency: number;

	constructor() {
		this.readPosition = 0;
	}

	create(hpack: HPACK, headers: string[][], flags: Flags, streamIdentifier: number, weight?: number): Frame {
		let paddingReserved: number = 0;
		if (flags.has(HeadersFrameFlags.PADDED)) {
			paddingReserved += 4;
		}

		let position: number = 0;

		const headerBuffer: Buffer = hpack.encode(headers);
		let payload: Buffer = Buffer.alloc(paddingReserved);

		if (flags.has(HeadersFrameFlags.PADDED)) {
			payload.writeUInt8(flags.get(HeadersFrameFlags.PADDED), position++);
		}

		if (flags.has(HeadersFrameFlags.PRIORITY)) {
			payload.writeUInt32BE(flags.get(HeadersFrameFlags.PRIORITY));
			payload.writeUInt8(weight);
		}

		payload = Buffer.concat([payload, headerBuffer]);

		if (flags.has(HeadersFrameFlags.PADDED)) {
			payload = Buffer.concat([payload, Buffer.alloc(flags.get(HeadersFrameFlags.PADDED)).fill(0x0)]);
		}

		const frame: Frame = new Frame();
		frame.create(FrameType.HEADERS, flags.toNumber(), streamIdentifier, payload);
		return frame;
	}

	read(frame: Frame, hpack: HPACK) {
		this.frame = frame;

		if (this.frame.getStreamIdentifier() === 0) {
			// TODO: Response with a PROTOCOL_ERROR
			return;
		}

		this.readPosition = 0;

		// TODO: Change connection state

		const hasPadding: boolean = this.frame.hasFlag(HeadersFrameFlags.PADDED);
		let paddingLength: number = 0;

		if (hasPadding) {
			paddingLength = this.frame.getPayload().readUInt8(this.readPosition++);

			if (paddingLength >= this.frame.getPayloadLength()) {
				// TODO: Response with PROTOCOL_ERROR
				return;
			}

			paddingLength += 1;
		}

		if (this.frame.hasFlag(HeadersFrameFlags.PRIORITY)) {
			this.streamDependency = this.frame.getPayload().readUInt32BE(this.readPosition);
			this.readPosition += 4;
			this.weight = this.frame.getPayload().readUInt8(this.readPosition++);
		}

		const headerBlock: Buffer = this.frame.getPayload().slice(this.readPosition);
		const decompressedHeaders: string[][] = hpack.decode(headerBlock);
		this.createHeadersMap(decompressedHeaders);
	}

	getHeaders(): Map<string, string> | undefined {
		return this.headers;
	}

	getWeight(): number {
		return this.weight;
	}

	getStreamDependency(): number {
		return this.streamDependency;
	}

	private createHeadersMap(headers: string[][]) {
		this.headers = new Map();

		for (const kv of headers) {
			const key: string = kv[0];
			const value: string = kv[1];

			this.headers.set(key, value);
		}
	}
}

export default HeadersFrame;
