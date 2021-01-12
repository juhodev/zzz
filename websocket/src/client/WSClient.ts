import * as net from 'net';
import Frame from '../frame/frame';
import { FrameData, Opcode } from '../frame/types';
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
			this.handleFrame(frame);
		});
	}

	writeRaw(str: string) {
		if (this.socket !== undefined) {
			console.error('Socket not attached!');
			return;
		}

		this.socket.write(str);
	}

	write(message: string, frameSize?: number) {
		if (frameSize !== undefined && message.length > frameSize) {
			this.sendFragmentedMessage(message, frameSize);
			return;
		}

		const frame: Frame = new Frame();
		frame.create(Opcode.TEXT_FRAME, message, true);
		this.socket.write(frame.toBuffer());
	}

	on(listener: listeners, callback: (message: string) => void) {
		switch (listener) {
			case 'message':
				this.onMessage = callback;
				break;
		}
	}

	ping() {
		const frame: Frame = new Frame();
		frame.create(Opcode.PING, 'ping', true);
		this.socket.write(frame.toBuffer());
	}

	private pong() {
		const frame: Frame = new Frame();
		frame.create(Opcode.PONG, '', true);
		this.socket.write(frame.toBuffer());
	}

	private handleFrame(frame: Frame) {
		const frameData: FrameData = frame.read();
		switch (frameData.opcode) {
			case Opcode.TEXT_FRAME:
				if (this.onMessage !== undefined) {
					this.onMessage(frameData.applicationData);
				}
				break;

			case Opcode.PONG:
				console.log('received pong');
				break;

			case Opcode.PING:
				this.pong();
				return;

			default:
				console.error(`Received a frame I couldnt handle!! (Opcode: ${frameData.opcode.toString(16)})`);
				return;
		}
	}

	private sendUpgradeToClient(clientData: Buffer) {
		const headers: Map<string, string> = parseHTTPHeaders(clientData);
		const serverHandshake: string = createServerOpeningHandshake(headers);
		this.socket.write(serverHandshake);
		this.upgraded = true;
	}

	private sendFragmentedMessage(message: string, frameSize: number) {
		const payloadSplit: string[] = [];

		let pos: number = 0;
		while (pos < message.length) {
			payloadSplit.push(message.substr(pos, frameSize));
			pos += frameSize;
		}

		const frames: Frame[] = [];
		const firstFrame: Frame = new Frame();
		firstFrame.create(Opcode.TEXT_FRAME, payloadSplit[0], false);
		frames.push(firstFrame);

		for (let i = 1; i < payloadSplit.length; i++) {
			const payload: string = payloadSplit[i];
			const frame: Frame = new Frame();
			if (i != payloadSplit.length - 1) {
				frame.create(Opcode.CONTINUATION_FRAME, payload, false);
			} else {
				frame.create(Opcode.CONTINUATION_FRAME, payload, true);
			}

			frames.push(frame);
		}

		for (const frame of frames) {
			this.socket.write(frame.toBuffer());
		}
	}
}

export default WSClient;