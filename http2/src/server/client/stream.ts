import Client from '../client';
import DataFrame from './frame/dataFrame/dataFrame';
import Flags from './frame/flags';
import Frame from './frame/frame';
import GoawayFrame from './frame/goawayFrame/goawayFrame';
import { compress } from './frame/headersFrame/headerCompression';
import HeadersFrame from './frame/headersFrame/headersFrame';
import PriorityFrame from './frame/priorityFrame/priorityFrame';
import PushPromiseFrame from './frame/pushPromiseFrame/pushPromiseFrame';
import RstStreamFrame from './frame/rstStreamFrame/rstStreamFrame';
import SettingsFrame from './frame/settingsFrame/settingsFrame';
import { SettingParam, SettingsFrameFlags } from './frame/settingsFrame/types';
import { FrameType } from './frame/types';
import { StreamState } from './types';

class Stream {
	private client: Client;
	private state: StreamState;
	private identifier: number;

	constructor(client: Client, identifier?: number) {
		this.client = client;
		this.state = StreamState.IDLE;
		this.identifier = identifier;
	}

	send(frame: Frame) {
		this.client.write(frame.toBuffer());
	}

	read(frame: Frame) {
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

	getState() {
		return this.state;
	}

	getIdentifier() {
		return this.identifier;
	}

	private handleDataFrame(frame: Frame) {
		const dataFrame: DataFrame = new DataFrame();
		dataFrame.read(frame);

		console.log(` <= DATA: ${frame.getPayloadLength()} bytes`);
	}

	private handleGoawayFrame(frame: Frame) {
		const goawayFrame: GoawayFrame = new GoawayFrame(frame);
		goawayFrame.read();

		console.log(
			` <= GOAWAY: Last stream id: ${goawayFrame.getLastStreamId()}, error code: ${goawayFrame.getErrorCode()}, debug information: ${goawayFrame.getAdditionalDebugData()}`,
		);
	}

	private createStream() {
		const headers: Buffer = compress([
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
		const headersFrame: HeadersFrame = new HeadersFrame(frame);
		headersFrame.read();
		console.log(` <= HEADERS: Received ${headersFrame.getHeaders().size} headers`);

		// const stream: Stream = this.client.createStream();

		this.createStream();

		const test: Frame = new DataFrame().create(
			Buffer.from('<html><head><title>Test</title></head><body>hello world</body></html>'),
			2,
			new Flags(),
		);
		this.send(test);
	}

	private handleRstStreamFrame(frame: Frame) {
		const rstStreamFrame: RstStreamFrame = new RstStreamFrame();
		rstStreamFrame.read(frame);

		console.log(` <= RST_STREAM: error code: ${rstStreamFrame.getErrorCode()}`);
	}

	private handlePriorityFrame(frame: Frame) {
		const priorityFrame: PriorityFrame = new PriorityFrame();
		priorityFrame.read(frame);

		console.log(
			` <= PRIORITY: Received a priority frame: stream dependency ${priorityFrame.getStreamDependency()}, weight: ${priorityFrame.getWeight()}`,
		);
	}

	private handleSettingsFrame(frame: Frame) {
		const settingsFrame: SettingsFrame = new SettingsFrame();
		settingsFrame.read(frame);

		if (frame.hasFlag(SettingsFrameFlags.ACK)) {
			console.log(` <= SETTINGS: Received ACK`);
			return;
		}

		this.client.setSettings(settingsFrame.getSettings());
		console.log(` <= SETTINGS: Received ${this.client.getSettings().size} settings`);

		let flags: number = 0;
		flags |= 1 << SettingsFrameFlags.ACK;

		const ackFrame: Frame = new SettingsFrame().create(flags, [], this.identifier);
		this.send(ackFrame);
		console.log(' => SETTINGS: Sending ACK');

		const serverSettingsFrame: Frame = new SettingsFrame().create(
			0,
			[{ key: SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS, value: 1000 }],
			this.identifier,
		);
		this.send(serverSettingsFrame);
		console.log(' => SETTINGS: Sending server settings');
	}
}

export default Stream;
