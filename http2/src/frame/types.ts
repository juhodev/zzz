export type Frame = {
	length: number;
	type: number;
	flags: number;
	steamIdentifier: number;
};

export enum FrameType {
	DATA = 0x0,
	HEADERS = 0x1,
	SETTINGS = 0x4,
}

export type Flag = {
	flag: number;
	data: any;
};
