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
import { FrameType } from './frame/types';
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
		console.log(
			` ===>>> ${prettifyFrameName(
				frame.getType(),
			)}: ${frame.getPayloadLength()} bytes on stream ${frame.getStreamIdentifier()}`,
			frame.toBuffer(),
		);
		this.client.write(frame.toBuffer());
	}

	read(frame: Frame) {
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

		// console.log(` <= DATA: ${frame.getPayloadLength()} bytes`);
	}

	private handleGoawayFrame(frame: Frame) {
		const goawayFrame: GoawayFrame = new GoawayFrame(frame);
		goawayFrame.read();

		// console.log(
		// 	` <= GOAWAY: Last stream id: ${goawayFrame.getLastStreamId()}, error code: ${goawayFrame.getErrorCode()}, debug information: ${goawayFrame.getAdditionalDebugData()}`,
		// );
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

	private handleRstStreamFrame(frame: Frame) {
		const rstStreamFrame: RstStreamFrame = new RstStreamFrame();
		rstStreamFrame.read(frame);

		// console.log(` <= RST_STREAM: error code: ${rstStreamFrame.getErrorCode()}`);
	}

	private handlePriorityFrame(frame: Frame) {
		const priorityFrame: PriorityFrame = new PriorityFrame();
		priorityFrame.read(frame);

		// console.log(
		// 	` <= PRIORITY: Received a priority frame: stream dependency ${priorityFrame.getStreamDependency()}, weight: ${priorityFrame.getWeight()}`,
		// );
	}

	private handleSettingsFrame(frame: Frame) {
		const settingsFrame: SettingsFrame = new SettingsFrame();
		settingsFrame.read(frame);

		if (frame.hasFlag(SettingsFrameFlags.ACK)) {
			// console.log(` <= SETTINGS: Received ACK`);
			return;
		}

		this.client.setSettings(settingsFrame.getSettings());
		// console.log(` <= SETTINGS: Received ${this.client.getSettings().size} settings`);

		let flags: number = 0;
		flags |= 1 << SettingsFrameFlags.ACK;

		const ackFrame: Frame = new SettingsFrame().create(flags, [], this.identifier);
		this.send(ackFrame);
		// console.log(' => SETTINGS: Sending ACK');

		const serverSettingsFrame: Frame = new SettingsFrame().create(
			0,
			this.client.getServerSettings(),
			this.identifier,
		);
		this.send(serverSettingsFrame);
		// console.log(' => SETTINGS: Sending server settings');
	}
}

export default Stream;
