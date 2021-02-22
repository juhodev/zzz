import Frame from '../frame';

class GoawayFrame {
	private frame: Frame;
	private readPosition: number;

	private lastStreamId: number;
	private errorCode: number;
	private additionalDebugData: Buffer;

	constructor(frame: Frame) {
		this.frame = frame;
		this.readPosition = 0;
	}

	read() {
		this.lastStreamId = this.frame.getPayload().readUInt32BE(this.readPosition);
		this.readPosition += 4;

		this.errorCode = this.frame.getPayload().readUInt32BE(this.readPosition);
		this.readPosition += 4;

		if (this.frame.getPayloadLength() > this.readPosition) {
			this.additionalDebugData = this.frame.getPayload().slice(this.readPosition);
		}
	}

	getLastStreamId(): number {
		return this.lastStreamId;
	}

	getErrorCode(): number {
		return this.errorCode;
	}

	getAdditionalDebugData(): Buffer {
		return this.additionalDebugData;
	}
}

export default GoawayFrame;
