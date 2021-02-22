import Frame from '../frame';

class PriorityFrame {
	private frame: Frame;
	private readPosition: number;

	private streamDependency: number;
	private weight: number;

	read(frame: Frame) {
		this.frame = frame;
		this.readPosition = 0;

		this.streamDependency = this.frame.getPayload().readUInt32BE(this.readPosition);
		this.readPosition += 4;

		this.weight = this.frame.getPayload().readUInt8(this.readPosition++);
	}

	getStreamDependency(): number {
		return this.streamDependency;
	}

	getWeight(): number {
		return this.weight;
	}
}

export default PriorityFrame;
