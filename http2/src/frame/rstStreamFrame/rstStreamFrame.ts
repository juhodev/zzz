import Frame from '../frame';

class RstStreamFrame {
	private frame: Frame;
	private readPosition: number;

	private errorCode: number;

	read(frame: Frame) {
		this.frame = frame;

		this.errorCode = this.frame.getPayload().readUInt32BE(0);
	}

	getErrorCode(): number {
		return this.errorCode;
	}
}

export default RstStreamFrame;
