import * as net from 'net';
import * as crypto from 'crypto';
import Frame from './frame/frame';
import { Opcode } from './frame/types';
import { write } from 'fs';

class Server {
	private upgraded: boolean;
	private x: number;
	constructor() {
		this.upgraded = false;
		this.x = 0;
	}

	start(port: number) {
		const server = net.createServer((socket) => {
			socket.on('data', (data) => {
				if (!this.upgraded) {
					console.log('RAW');
					console.log(data.toString());
					console.log('END OF RAW');
					const headers: Map<string, string> = this.parseHTTPHeaders(data);
					console.log(headers);
					const serverHandshake: string = this.sendServerOpeningHandshake(headers);
					console.log('sending', serverHandshake);
					socket.write(serverHandshake);
					this.upgraded = true;

					setTimeout(() => {
						this.send(socket, 'I CAN SEND MESSAGES');
					}, 1000);
				} else {
					// console.log('received from client', JSON.stringify(data));
					const frame: Frame = new Frame(data);
					console.log('FRAME:', JSON.stringify(frame.read()));
					if (this.x !== 0) {
						return;
					}

					this.x++;
				}
			});
		});

		server.listen(port, () => {
			console.log(`Opening server on port ${port}`);
		});
	}

	send(socket: net.Socket, str: string) {
		const frame: Frame = new Frame();
		frame.create(Opcode.TEXT_FRAME, str);
		console.log('Sending frame', JSON.stringify(frame.read()));
		socket.write(frame.toBuffer());
	}

	parseHTTPHeaders(data: Buffer): Map<string, string> {
		const values: Map<string, string> = new Map();

		// Might change this in the future I don't know
		const asString: string = data.toString();
		const lines: string[] = asString.split('\r\n');

		const typeOfMessage: string = lines.shift();
		// for testing I know that it'll always be GET / HTTP/1.1

		for (const line of lines) {
			if (line.length === 0) {
				continue;
			}
			const keyValueSplit: number = line.indexOf(':');
			const key: string = line.substr(0, keyValueSplit);
			const value: string = line.substr(keyValueSplit + 2, line.length);
			values.set(key, value);
		}

		return values;
	}

	sendServerOpeningHandshake(clientHeaders: Map<string, string>): string {
		let handshake: string = '';
		handshake += 'HTTP/1.1 101 Switching Protocols\r\n';
		handshake += 'Upgrade: websocket\r\n';
		handshake += 'Connection: Upgrade\r\n';

		const secWebSocketKey: string = clientHeaders.get('Sec-WebSocket-Key');
		const concat: string = secWebSocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
		const sha1: string = this.sha1(concat);

		handshake += `Sec-WebSocket-Accept: ${sha1}\r\n\n`;

		return handshake;
	}

	private sha1(str: string): string {
		const sha = crypto.createHash('sha1');
		sha.update(str);
		return sha.digest('base64');
	}
}

export default Server;
