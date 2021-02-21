import Frame from '../frame';
import { Setting } from './types';

class SettingsFrame {
	private frame: Frame;
	private readPosition: number;

	private settings: Map<number, Setting>;

	constructor(frame: Frame) {
		this.frame = frame;
		this.readPosition = 0;
	}

	read() {
		if (this.frame.getStreamIdentifier() !== 0) {
			// PROTOCOL_ERROR
			return;
		}

		const buffer: Buffer = this.frame.getPayload();

		this.settings = new Map();

		this.readPosition = 0;
		while (this.readPosition < this.frame.getPayloadLength()) {
			const identifier: number = buffer.readUInt16BE(this.readPosition);
			this.readPosition += 2;
			const value: number = buffer.readUInt32BE(this.readPosition);
			this.readPosition += 4;

			const setting: Setting = { key: identifier, value };
			this.settings.set(setting.key, setting);
		}
	}

	getSettings(): Map<number, Setting> | undefined {
		return this.settings;
	}
}

export default SettingsFrame;
