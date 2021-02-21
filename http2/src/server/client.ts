import * as tls from 'tls';
import { Header, RequestData, Resource, ResourceType } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { isNil } from '../utilts';
import SettingsFrame from '../frame/settingsFrame/settingsFrame';
import * as ByteBuffer from 'bytebuffer';
import HeadersFrame from '../frame/headersFrame/headersFrame';
import Frame from '../frame/frame';
import { FrameType } from '../frame/types';
import DataFrame from '../frame/dataFrame/dataFrame';

class Client {
	upgraded: boolean;
	private socket: tls.TLSSocket;

	constructor() {
		this.upgraded = false;
	}

	attach(socket: tls.TLSSocket) {
		this.socket = socket;

		this.socket.on('data', (data: Buffer) => {
			if (this.upgraded) {
				// console.log(data);
				// const test: HeadersFrame = new HeadersFrame(ByteBuffer.wrap(data));
				// test.read();

				// console.log(test.getHeaders());
				this.handleFrame(data);
				return;
			}

			const dataStr: string = data.toString('utf-8');
			const requestData: RequestData = this.parseRequest(dataStr);

			console.log(requestData);
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
			// this.socket.write(this.sendHTTP1Webpage());
		});
	}

	private handleFrame(data: Buffer) {
		const frame: Frame = new Frame(ByteBuffer.wrap(data));
		frame.read();

		console.log('received frame', frame.getType());

		switch (frame.getType()) {
			case FrameType.DATA:
				const dataFrame: DataFrame = new DataFrame(frame);
				dataFrame.read();
				console.log(dataFrame.getData().toString());
				break;

			case FrameType.HEADERS:
				const headersFrame: HeadersFrame = new HeadersFrame(frame);
				headersFrame.read();
				console.log('headers', headersFrame.getHeaders());
				break;

			case FrameType.SETTINGS:
				this.handleSettingsFrame(frame);
				break;
		}
	}

	private handleSettingsFrame(frame: Frame) {
		const settingsFrame: SettingsFrame = new SettingsFrame(frame);
		settingsFrame.read();
		console.log(settingsFrame.getSettings());

		// TODO: Send a settings frame back
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
