import * as net from 'net';
import Frame from '../frame/frame';
import { Opcode } from '../frame/types';
import { createServerOpeningHandshake, parseHTTPHeaders } from '../utils';
import { listeners } from './types';

class WSClient {
	upgraded: boolean;

	private socket: net.Socket;
	private onMessage: (message: string) => void;

	constructor() {
		this.upgraded = false;
	}

	attach(socket: net.Socket) {
		this.socket = socket;

		this.socket.on('data', (data) => {
			if (!this.upgraded) {
				this.sendUpgradeToClient(data);
				return;
			}

			const frame: Frame = new Frame(data);
			if (this.onMessage !== undefined) {
				const message: string = frame.read().applicationData;
				this.onMessage(message);
			}
		});
	}

	writeRaw(str: string) {
		if (this.socket !== undefined) {
			console.error('Socket not attached!');
			return;
		}

		this.socket.write(str);
	}

	write(message: string) {
		const frame: Frame = new Frame();
		frame.create(Opcode.TEXT_FRAME, message);
		this.socket.write(frame.toBuffer());
	}

	on(listener: listeners, callback: (message: string) => void) {
		switch (listener) {
			case 'message':
				this.onMessage = callback;
				break;
		}
	}

	private sendUpgradeToClient(clientData: Buffer) {
		const headers: Map<string, string> = parseHTTPHeaders(clientData);
		const serverHandshake: string = createServerOpeningHandshake(headers);
		this.socket.write(serverHandshake);
		this.upgraded = true;
	}
}

export default WSClient;
