import { loadResource } from '../../resourceLoader';
import { isNil, prettifyFrameName } from '../../utilts';
import Client from '../client';
import { Resource } from '../types';
import DataFrame from './frame/dataFrame/dataFrame';
import { DataFrameFlags } from './frame/dataFrame/types';
import Flags from './frame/flags';
import Frame from './frame/frame';
import GoawayFrame from './frame/goawayFrame/goawayFrame';
import HeadersFrame from './frame/headersFrame/headersFrame';
import { HeadersFrameFlags } from './frame/headersFrame/types';
import PriorityFrame from './frame/priorityFrame/priorityFrame';
import PushPromiseFrame from './frame/pushPromiseFrame/pushPromiseFrame';
import RstStreamFrame from './frame/rstStreamFrame/rstStreamFrame';
import SettingsFrame from './frame/settingsFrame/settingsFrame';
import { SettingsFrameFlags } from './frame/settingsFrame/types';
import { FrameType, GLOBAL_FLAG } from './frame/types';
import { StreamState } from './types';

class Stream {
	private client: Client;
	private state: StreamState;
	private identifier: number;

	private initiatedByServer: boolean;

	constructor(client: Client, identifier: number, initiatedByServer: boolean) {
		this.client = client;
		this.state = StreamState.IDLE;
		this.identifier = identifier;
		this.initiatedByServer = initiatedByServer;
	}

	send(frame: Frame) {
		// reserved (remote)
		// An endpoint MUST NOT send any type of frame other than RST_STREAM, WINDOW_UPDATE, or
		// PRIORITY in this state
		if (this.state === StreamState.RESERVED_REMOTE) {
			const acceptableFrameTypes: FrameType[] = [
				FrameType.RST_STREAM,
				FrameType.WINDOW_UPDATE,
				FrameType.PRIORITY,
			];

			if (!acceptableFrameTypes.includes(frame.getType())) {
				console.error(
					`Tried to send a frame type of ${frame.getType()} when the connection was in "${this.state}" state`,
				);
				return;
			}
		}

		// half-closed (local)
		// A stream in the "half-closed (local)" state cannot be used for sending frames other than WINDOW_UPDATE,
		// PRIORITY, and RST_STREAM
		if (this.state === StreamState.HALF_CLOSED_LOCAL) {
			const acceptableFrameTypes: FrameType[] = [
				FrameType.WINDOW_UPDATE,
				FrameType.PRIORITY,
				FrameType.RST_STREAM,
			];

			if (!acceptableFrameTypes.includes(frame.getType())) {
				console.error(
					`Tried to send a frame type of ${frame.getType()} when the connection was in "${this.state}" state`,
				);
				return;
			}
		}

		// idle
		// Sending or receiving a HEADERS frame causes the stream
		// to become "open"
		if (this.state === StreamState.IDLE && frame.getType() === FrameType.HEADERS) {
			this.changeState(StreamState.OPEN);
		}

		// reserved (local)
		// The endpoint can send a HEADERS frame. This causes the stream to
		// open in a "half-closed (remote)" state.
		if (this.state === StreamState.RESERVED_LOCAL && frame.getType() === FrameType.HEADERS) {
			this.changeState(StreamState.HALF_CLOSED_REMOTE);
		}

		// reserved (remote), reserved (local)
		// Either endpoint can send a RST_STREAM frame to cause the
		// stream to become "closed". This releases the stream reservations.
		if (frame.getType() === FrameType.RST_STREAM) {
			this.changeState(StreamState.CLOSED);
			// TODO: Release stream reservation
		}

		// open
		// From this state, either endpoint can send a frame with an END_STREAM flag set,
		// which causes the stream to transition into one of the "half-closed" states
		// 		An endpoint sending an END_STREAM flag causes the stream state to become
		// 		"half-closed (local)"
		if (this.state === StreamState.OPEN && frame.hasFlag(GLOBAL_FLAG.END_STREAM)) {
			this.changeState(StreamState.HALF_CLOSED_LOCAL);
		}

		// half-closed (remote)
		// A stream can transition from this state to "closed" by sending a frame
		// that contains an END_STREAM flag or when either peer sends a RST_STREAM frame
		if (this.state === StreamState.HALF_CLOSED_REMOTE) {
			this.changeState(StreamState.CLOSED);
		}

		console.log(
			` ===>>> ${prettifyFrameName(
				frame.getType(),
			)}: ${frame.getPayloadLength()} bytes on stream ${frame.getStreamIdentifier()}`,
			frame.toBuffer(),
		);
		this.client.write(frame.toBuffer());
	}

	read(frame: Frame) {
		// reserved (local)
		// Receving any type of frame other than RST_STREAM, PRIORITY, or WINDOW_UPDATE
		// on a stream in this state MUST be treated as a connection
		// error of type PROTOCOL_ERROR
		if (this.state === StreamState.RESERVED_LOCAL) {
			const acceptableFrameTypes: FrameType[] = [
				FrameType.RST_STREAM,
				FrameType.WINDOW_UPDATE,
				FrameType.PRIORITY,
			];

			if (!acceptableFrameTypes.includes(frame.getType())) {
				// TODO: Send a connection error of type PROTOCOL_ERROR
				return;
			}
		}

		// reserved (remote)
		// Receving any type of frame other than HEADERS, RST_STREAM, or PRIORITY on a stream
		// in this state MUST be treated as a connection error of type PROTOCOL_ERROR
		if (this.state === StreamState.RESERVED_REMOTE) {
			const acceptableFrameTypes: FrameType[] = [FrameType.HEADERS, FrameType.RST_STREAM, FrameType.PRIORITY];

			if (!acceptableFrameTypes.includes(frame.getType())) {
				// TODO: Send a connection error of type PROTOCOL_ERROR
				return;
			}
		}

		// half-closed (remote)
		// If an endpoint receives additional framers, other than WINDOW_UPDATE, PRIORITY,
		// or RST_STREAM, for a stream that is in this state it MUST respond with a stream error
		// of type STREAM_CLOSED
		if (this.state === StreamState.HALF_CLOSED_REMOTE) {
			const acceptableFrameTypes: FrameType[] = [
				FrameType.WINDOW_UPDATE,
				FrameType.PRIORITY,
				FrameType.RST_STREAM,
			];

			if (!acceptableFrameTypes.includes(frame.getType())) {
				// TODO: Send a stream error of type STREAM_CLOSED
				return;
			}
		}

		// Either endpoint can send a RST_STREAM frame to cause the
		// stream to beocme "closed". This releases the stream reservations.
		if (frame.getType() === FrameType.RST_STREAM) {
			this.changeState(StreamState.CLOSED);
			// TODO: Release stream reservation
		}

		// open
		// From this state, either endpoint can send a frame with an END_STREAM flag set,
		// which causes the stream to transition into one of the "half-closed" states
		// 		An endpoint receiving an END_STREAM flag causes the stream to
		//		become "half-closed (remote)"
		if (this.state === StreamState.OPEN && frame.hasFlag(GLOBAL_FLAG.END_STREAM)) {
			this.changeState(StreamState.HALF_CLOSED_REMOTE);
		}

		// half-closed (local)
		// A stream transitions from this state to "closed" when a frame that contains
		// an END_STREAM flag is received or when either peer sends a RST_STREAM frame
		if (this.state === StreamState.HALF_CLOSED_LOCAL && frame.hasFlag(GLOBAL_FLAG.END_STREAM)) {
			this.changeState(StreamState.CLOSED);
		}

		console.log(
			` <<<=== ${prettifyFrameName(
				frame.getType(),
			)}: ${frame.getPayloadLength()} bytes on stream ${frame.getStreamIdentifier()}`,
		);
		switch (frame.getType()) {
			case FrameType.DATA:
				this.handleDataFrame(frame);
				break;

			case FrameType.HEADERS:
				this.handleHeadersFrame(frame);
				break;

			case FrameType.PRIORITY:
				this.handlePriorityFrame(frame);
				break;

			case FrameType.RST_STREAM:
				this.handleRstStreamFrame(frame);
				break;

			case FrameType.SETTINGS:
				this.handleSettingsFrame(frame);
				break;

			case FrameType.GOAWAY:
				this.handleGoawayFrame(frame);
				break;

			default:
				console.log(` <= RECEIVED A FRAME THAT COULDN'T BE PARSED (type ${frame.getType()})`);
				break;
		}
	}

	wasInitiatedByServer(): boolean {
		return this.initiatedByServer;
	}

	getState() {
		return this.state;
	}

	getIdentifier() {
		return this.identifier;
	}

	private handleDataFrame(frame: Frame) {
		const dataFrame: DataFrame = new DataFrame();
		dataFrame.read(frame);
	}

	private handleGoawayFrame(frame: Frame) {
		const goawayFrame: GoawayFrame = new GoawayFrame(frame);
		goawayFrame.read();
	}

	private createStream() {
		const headers: Buffer = this.client.getHPACK().encode([
			[':authority', 'localhost'],
			['method', 'GET'],
			[':path', '/'],
			[':scheme', 'https'],
		]);

		const pushPromise: Frame = new PushPromiseFrame().create(
			this.client.streamIdentifierCounter,
			headers,
			new Flags(),
			this.identifier,
		);

		this.send(pushPromise);
	}

	private handleHeadersFrame(frame: Frame) {
		// Sending or receiving a HEADERS frame causes the stream to
		// become "open"
		if (this.state === StreamState.IDLE) {
			this.changeState(StreamState.OPEN);
		}

		// Receiving a HEADERS frame causes the stream to transition
		// to "half-closed (local)"
		if (this.state === StreamState.RESERVED_REMOTE) {
			this.changeState(StreamState.HALF_CLOSED_LOCAL);
		}

		const headersFrame: HeadersFrame = new HeadersFrame();
		headersFrame.read(frame, this.client.getHPACK());

		const resourcePath: string = headersFrame.getHeaders().get(':path');
		const resource: Resource = loadResource(resourcePath);

		if (isNil(resource)) {
			const serverHeadersFrame: Frame = new HeadersFrame().create(
				this.client.getHPACK(),
				[
					[':status', '404'],
					[':version', 'HTTP/2.0'],
				],
				new Flags().add({ flag: HeadersFrameFlags.END_HEADERS, data: 1 }),
				frame.getStreamIdentifier(),
			);
			this.send(serverHeadersFrame);

			const data: Frame = new DataFrame().create(
				Buffer.alloc(0),
				frame.getStreamIdentifier(),
				new Flags().add({ flag: DataFrameFlags.END_STREAM, data: 1 }),
			);
			this.send(data);
			return;
		}

		const data: Buffer = Buffer.from(resource.content);
		const serverHeadersFrame: Frame = new HeadersFrame().create(
			this.client.getHPACK(),
			[
				[':status', '200'],
				[':version', 'HTTP/2.0'],
				['vary', 'Accept-Encoding'],
				['content-type', resource.contentType],
				['content-length', data.length.toString()],
			],
			new Flags().add({ flag: HeadersFrameFlags.END_HEADERS, data: 1 }),
			frame.getStreamIdentifier(),
		);
		this.send(serverHeadersFrame);

		const test: Frame = new DataFrame().create(
			data,
			frame.getStreamIdentifier(),
			new Flags().add({ flag: DataFrameFlags.END_STREAM, data: 1 }),
		);
		this.send(test);
	}

	private changeState(state: StreamState) {
		console.log(`[STREAM STATE] Changing state from ${this.state} to ${state}`);
		this.state = state;
	}

	private handleRstStreamFrame(frame: Frame) {
		const rstStreamFrame: RstStreamFrame = new RstStreamFrame();
		rstStreamFrame.read(frame);
	}

	private handlePriorityFrame(frame: Frame) {
		const priorityFrame: PriorityFrame = new PriorityFrame();
		priorityFrame.read(frame);
	}

	private handleSettingsFrame(frame: Frame) {
		const settingsFrame: SettingsFrame = new SettingsFrame();
		settingsFrame.read(frame);

		if (frame.hasFlag(SettingsFrameFlags.ACK)) {
			return;
		}

		this.client.setSettings(settingsFrame.getSettings());

		let flags: number = 0;
		flags |= 1 << SettingsFrameFlags.ACK;

		const ackFrame: Frame = new SettingsFrame().create(flags, [], this.identifier);
		this.send(ackFrame);

		const serverSettingsFrame: Frame = new SettingsFrame().create(
			0,
			this.client.getServerSettings(),
			this.identifier,
		);
		this.send(serverSettingsFrame);
	}
}

export default Stream;
