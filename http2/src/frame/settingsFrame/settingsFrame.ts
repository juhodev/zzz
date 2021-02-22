import Frame from '../frame';
import { FrameType } from '../types';
import { Setting } from './types';

class SettingsFrame {
	private frame: Frame;
	private readPosition: number;

	private settings: Map<number, Setting>;

	constructor() {}

	read(frame: Frame) {
		this.frame = frame;
		this.readPosition = 0;

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

	create(flags: number, settings: Setting[]): Frame {
		const settingsPayload: Buffer = Buffer.alloc(settings.length * (2 + 4));

		let position: number = 0;
		for (const setting of settings) {
			settingsPayload.writeUInt16BE(setting.key, position);
			position += 2;
			settingsPayload.writeUInt32BE(setting.value, position);
			position += 4;
		}

		const frame: Frame = new Frame();
		frame.create(FrameType.SETTINGS, flags, 0, settingsPayload);
		return frame;
	}
}

export default SettingsFrame;
