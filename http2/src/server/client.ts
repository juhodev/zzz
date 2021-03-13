import * as tls from 'tls';
import { Header, RequestData, Resource, ResourceType } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { isNil } from '../utilts';
import Frame from './client/frame/frame';
import { Setting, SettingParam } from './client/frame/settingsFrame/types';
import Stream from './client/stream';
import { StreamState } from './client/types';
import * as HPACK from 'hpack';

class Client {
	upgraded: boolean;
	streamIdentifierCounter: number;

	private socket: tls.TLSSocket;

	private serverSettings: Map<number, Setting>;
	private clientSettings: Map<number, Setting>;

	private hpackContext: HPACK;

	private streams: Stream[];

	constructor() {
		// The stream identifier 0x0 is reserved for connection control frames and
		// the streams created by the server must be even.
		this.streamIdentifierCounter = 2;
		this.upgraded = false;

		this.serverSettings = new Map();
		this.serverSettings.set(SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS, {
			key: SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS,
			value: 1000,
		});
		this.clientSettings = new Map();

		this.streams = [];
		this.hpackContext = new HPACK();
	}

	attach(socket: tls.TLSSocket) {
		this.socket = socket;

		this.socket.on('data', (data: Buffer) => {
			if (this.upgraded) {
				this.handleFrame(data);
				return;
			}

			const dataStr: string = data.toString('utf-8');
			const requestData: RequestData = this.parseRequest(dataStr);

			if (requestData.method === 'HTTP/2.0') {
				this.upgraded = true;
				const settingsFrame: Buffer = Buffer.alloc(data.length - 24);
				data.copy(settingsFrame, 0, 24, data.length);
				this.handleFrame(settingsFrame);
				return;
			}

			const resource: Resource = this.loadResource(requestData.resource);
			if (isNil(resource)) {
				const response: string = this.createResponse(
					{ content: 'Resource not found!', contentType: 'text/plain' },
					'404 Not Found',
					[],
				);

				this.socket.write(response);
				return;
			}

			const response: string = this.createResponse(resource, '200 OK', [{ key: 'Upgrade', value: 'HTTP/2.0' }]);
			this.socket.write(response);
		});
	}

	write(buffer: Buffer) {
		this.socket.write(buffer);
	}

	getSettings(): Map<number, Setting> {
		return this.clientSettings;
	}

	setSettings(settings: Map<number, Setting>) {
		this.clientSettings = settings;
	}

	getServerSettings(): Setting[] {
		const settings: Setting[] = [];

		for (const serverSetting of this.serverSettings) {
			settings.push(serverSetting[1]);
		}

		return settings;
	}

	createStream(): Stream {
		let maxStreams: number;
		if (this.clientSettings.has(SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS)) {
			maxStreams = this.clientSettings.get(SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS).value;
		} else {
			maxStreams = Infinity;
		}

		// If the active stream count created by the server exceeds the max limit set by the client then
		// do not create a new stream.
		// rfc7540#section-5.1.2
		if (this.countStreamsCreatedByServer() > maxStreams) {
			return;
		}

		const stream: Stream = new Stream(this, this.streamIdentifierCounter, true);
		this.streamIdentifierCounter += 2;

		this.streams.push(stream);
		this.closeOldStreams(stream.getIdentifier());

		return stream;
	}

	getHPACK(): HPACK {
		return this.hpackContext;
	}

	private countStreamsCreatedByServer(): number {
		return this.streams.filter((stream) => stream.wasInitiatedByServer()).length;
	}

	private countStreamsCreatedByClient(): number {
		return this.streams.filter((stream) => !stream.wasInitiatedByServer()).length;
	}

	/**
	 * Closes all old streams that are in the 'idle' state according to the spec.
	 *
	 *  "The first use of a new stream identifier implicitly closes all
	 *  streams in the "idle" state that might have been initiated by that
	 *  peer with a lower-valued stream identifier.  For example, if a client
	 *  sends a HEADERS frame on stream 7 without ever sending a frame on
	 *  stream 5, then stream 5 transitions to the "closed" state when the
	 *  first frame for stream 7 is sent or received."
	 *
	 * @param newStreamIdentifier Identifier for a new stream that has not been seen before
	 */
	private closeOldStreams(newStreamIdentifier: number) {
		this.streams = this.streams.filter(
			(stream) => stream.getIdentifier() < newStreamIdentifier && stream.getState() == StreamState.IDLE,
		);
	}

	private handleFrame(data: Buffer) {
		// console.log(`<= ${data.length}`);
		const frame: Frame = new Frame();
		frame.read(data);

		let stream: Stream = this.streams.find((s) => s.getIdentifier() === frame.getStreamIdentifier());
		if (stream === undefined) {
			let maxStreams: number;
			if (this.serverSettings.has(SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS)) {
				maxStreams = this.serverSettings.get(SettingParam.SETTINGS_MAX_CONCURRENT_STREAMS).value;
			} else {
				maxStreams = Infinity;
			}

			if (this.countStreamsCreatedByClient() > maxStreams) {
				// TODO: Responde with PROTOCOL_ERROR
				return;
			}

			stream = new Stream(this, frame.getStreamIdentifier(), false);
			this.streams.push(stream);
			console.log(`[STREAM] Creating stream with id ${stream.getIdentifier()}`);

			this.closeOldStreams(frame.getStreamIdentifier());
		}

		stream.read(frame);
	}

	private createResponse(resource: Resource, responseCode: string, extraHeaders: Header[]): string {
		let response: string = '';
		response += `HTTP/1.1 ${responseCode}\r\n`;
		response += `Content-Length: ${resource.content.length}\r\n`;
		response += `Content-Type: ${resource.contentType}\r\n`;

		for (const header of extraHeaders) {
			response += `${header.key}: ${header.value}\r\n`;
		}

		response += '\r\n';
		response += resource.content;
		return response;
	}

	private parseRequest(data: string): RequestData {
		const lineSplit: string[] = data.split('\r\n');

		const firstLine: string = lineSplit.shift();
		const requestDataSplit: string[] = firstLine.split(' ');

		const method: string = requestDataSplit.pop();
		const resource: string = requestDataSplit.pop();
		const protocol: string = requestDataSplit.pop();

		const headers: Map<string, string> = new Map();

		for (const line of lineSplit) {
			if (line.length === 0) {
				break;
			}

			const keyValueSplit: number = line.indexOf(': ');
			const key: string = line.substr(0, keyValueSplit);
			const value: string = line.substr(keyValueSplit + 2, line.length);

			headers.set(key, value);
		}

		return {
			method,
			protocol,
			resource,
			headers,
		};
	}

	private upgradeRequiredResponse(): string {
		let response: string = '';

		response += 'HTTP/1.1 426 Upgrade Required\r\n';
		response += 'Upgrade: HTTP/2.0\r\n';
		response += 'Connection: Upgrade\r\n';
		response += 'Content-Length: 53\r\n';
		response += 'Content-Type: text/plain\r\n';
		response += '\r\n';
		response += 'This service requires use of the HTTP/2.0 protocol\r\n';
		return response;
	}

	private sendHTTP1Webpage() {
		const page: string = this.createWebPage();

		let response: string = '';
		response += 'HTTP/1.1 200 OK\r\n';
		response += `Content-Length: ${page.length}\r\n`;
		response += `Content-Type: text/html\r\n`;
		response += `Upgrade: HTTP/2.0\r\n`;
		response += '\r\n';
		response += page;
		return response;
	}

	private createWebPage(): string {
		let webPage: string = '';
		webPage += '<html>';
		webPage += '<head>';
		webPage += '<title>Test website</title>';
		webPage += '</head>';
		webPage += '<body>';
		webPage += '<span>HELLO WORLD</span>';
		webPage += '</body>';
		webPage += '</html>';

		return webPage;
	}

	loadResource(resourceName: string): Resource {
		if (resourceName === '/') {
			resourceName = 'index.html';
		} else {
			resourceName = resourceName.substr(1, resourceName.length);
		}

		const resourcePath: string = path.resolve('dist', resourceName);
		if (!fs.existsSync(resourcePath)) {
			return undefined;
		}

		let resourceType: ResourceType = undefined;

		const supportedFileTypes: ResourceType[] = [
			{ ending: '.html', contentType: 'text/html' },
			{ ending: '.txt', contentType: 'text/plain' },
			{ ending: '.js', contentType: 'text/javascript' },
		];
		for (const fileType of supportedFileTypes) {
			if (resourceName.toLowerCase().endsWith(fileType.ending)) {
				resourceType = fileType;
				break;
			}
		}

		if (isNil(resourceType)) {
			return undefined;
		}

		const content: string = fs.readFileSync(resourcePath, 'utf-8');
		return { contentType: resourceType.contentType, content };
	}
}

export default Client;
