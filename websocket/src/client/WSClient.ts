import * as net from 'net';
import Frame from '../frame/frame';
import { FrameData, Opcode } from '../frame/types';
import { createClientOpeningHandshake, createServerOpeningHandshake, parseHTTPHeaders } from '../utils';
import { ClientListeners, ClientType } from './types';

class WSClient {
	type: ClientType;

	upgraded: boolean;

	private socket: net.Socket;
	private onMessage: (message: string) => void;
	private onClose: (message: string) => void;
	private onConnection: () => void;

	private currentFrames: FrameData[];

	constructor() {
		this.upgraded = false;
		this.currentFrames = [];
		this.type = ClientType.SERVER_CLIENT;
	}

	attach(socket: net.Socket) {
		this.socket = socket;

		this.socket.on('data', (data) => {
			if (!this.upgraded) {
				if (this.type === ClientType.SERVER_CLIENT) {
					this.sendUpgradeToClient(data);
				} else {
					this.upgraded = true;
					this.onConnection();
				}
				return;
			}

			const frame: Frame = new Frame(data);
			this.handleFrame(frame);
		});
	}

	connect(host: string, port: number) {
		this.type = ClientType.REAL_CLIENT;
		const socket: net.Socket = new net.Socket();
		socket.connect({ host, port });

		socket.on('connect', () => {
			const handshake: string = createClientOpeningHandshake(host, port);
			socket.write(handshake);
			this.attach(socket);
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
		frame.create(Opcode.TEXT_FRAME, message, true, this.type);
		this.socket.write(frame.toBuffer());
	}

	on(listener: ClientListeners, callback: (message?: string) => void) {
		switch (listener) {
			case 'message':
				this.onMessage = callback;
				break;

			case 'close':
				this.onClose = callback;
				break;

			case 'connection':
				this.onConnection = callback;
				break;
		}
	}

	ping() {
		const frame: Frame = new Frame();
		frame.create(Opcode.PING, 'ping', true, this.type);
		this.socket.write(frame.toBuffer());
	}

	closeConnection(reason: string) {
		const frame: Frame = new Frame();
		frame.create(Opcode.CONNECTION_CLOSE, reason, true, this.type);
		this.socket.write(frame.toBuffer());
		this.socket.destroy();
	}

	private pong() {
		const frame: Frame = new Frame();
		frame.create(Opcode.PONG, 'pong', true, this.type);
		this.socket.write(frame.toBuffer());
	}

	private handleFrame(frame: Frame) {
		const frameData: FrameData = frame.read();

		if (this.type === ClientType.SERVER_CLIENT && frameData.mask === 0) {
			this.closeConnection('Incorrect mask');
			return;
		}

		switch (frameData.opcode) {
			case Opcode.TEXT_FRAME:
				this.handleMessage(frameData);
				break;

			case Opcode.PONG:
				console.log('received pong');
				break;

			case Opcode.PING:
				this.pong();
				break;

			case Opcode.CONNECTION_CLOSE:
				if (this.onClose !== undefined) {
					this.onClose(frameData.applicationData);
				}
				break;

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

	private handleMessage(frame: FrameData) {
		if (frame.FIN === 1) {
			if (this.currentFrames.length === 0) {
				if (this.onMessage !== undefined) {
					this.onMessage(frame.applicationData);
				}
				return;
			}

			let concatinatedMessage: string = '';
			for (const frame of this.currentFrames) {
				concatinatedMessage += frame.applicationData;
			}
			concatinatedMessage += frame.applicationData;

			if (this.onMessage !== undefined) {
				this.onMessage(concatinatedMessage);
			}

			this.currentFrames = [];
			return;
		}

		this.currentFrames.push(frame);
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
		firstFrame.create(Opcode.TEXT_FRAME, payloadSplit[0], false, this.type);
		frames.push(firstFrame);

		for (let i = 1; i < payloadSplit.length; i++) {
			const payload: string = payloadSplit[i];
			const frame: Frame = new Frame();
			if (i != payloadSplit.length - 1) {
				frame.create(Opcode.CONTINUATION_FRAME, payload, false, this.type);
			} else {
				frame.create(Opcode.CONTINUATION_FRAME, payload, true, this.type);
			}

			frames.push(frame);
		}

		for (const frame of frames) {
			this.socket.write(frame.toBuffer());
		}
	}
}

export default WSClient;
