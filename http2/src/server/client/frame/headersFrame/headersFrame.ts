import * as ByteBuffer from 'bytebuffer';
import { hasBitSet } from '../../../../utilts';
import Flags from '../flags';
import Frame from '../frame';
import { FrameType } from '../types';
import { compress, decompress } from './headerCompression';
import { HeadersFrameFlags } from './types';

class HeadersFrame {
	private frame: Frame;
	private readPosition: number;

	private headers: Map<string, string>;
	private weight: number;
	private streamDependency: number;

	constructor(frame: Frame) {
		this.frame = frame;
		this.readPosition = 0;
	}

	createHeadersFrame(streamIndentifier: number, priority: number, headers: string[][], flags: Flags) {
		// let flagsBits: number = 0;
		// if (flags.has(HeadersFrameFlags.END_STREAM)) {
		// 	flagsBits |= HeadersFrameFlags.END_STREAM;
		// }
		// if (flags.has(HeadersFrameFlags.END_HEADERS)) {
		// 	flagsBits |= HeadersFrameFlags.END_HEADERS;
		// }
		// if (flags.has(HeadersFrameFlags.PADDED)) {
		// 	flagsBits |= HeadersFrameFlags.PADDED;
		// }
		// if (flags.has(HeadersFrameFlags.PRIORITY)) {
		// 	flagsBits |= HeadersFrameFlags.PRIORITY;
		// }
		// const headerBlock: Buffer = compress(headers);
		// let paddingAmount: number = 0;
		// if (flags.has(HeadersFrameFlags.PADDED)) {
		// 	paddingAmount = flags.get(HeadersFrameFlags.PADDED);
		// }
		// super.create(headerBlock.length + paddingAmount, FrameType.HEADERS, flagsBits, streamIndentifier);
		// if (flags.has(HeadersFrameFlags.PADDED)) {
		// 	this.byteBuffer.writeInt8(flags.get(HeadersFrameFlags.PADDED));
		// }
		// if (flags.has(HeadersFrameFlags.PRIORITY)) {
		// 	this.byteBuffer.writeUint32(flags.get(HeadersFrameFlags.PRIORITY));
		// 	this.byteBuffer.writeUint8(priority);
		// }
		// this.byteBuffer.append(headerBlock);
		// // TODO: Figure when to use a continuation block
		// if (flags.has(HeadersFrameFlags.PADDED)) {
		// 	const paddingBuffer: Buffer = Buffer.alloc(flags.get(HeadersFrameFlags.PADDED)).fill(0x0);
		// 	this.byteBuffer.append(paddingBuffer);
		// }
	}

	read() {
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
		const decompressedHeaders: string[][] = decompress(headerBlock);
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
