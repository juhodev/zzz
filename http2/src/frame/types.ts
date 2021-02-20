export type Frame = {
	length: number;
	type: number;
	flags: number;
	steamIdentifier: number;
};

export enum FrameType {
	DATA = 0x0,
}

export enum DataFrameFlags {
	END_STREAM = 0x1,
	PADDED = 0x8,
}
