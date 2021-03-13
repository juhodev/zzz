export type Frame = {
	length: number;
	type: number;
	flags: number;
	steamIdentifier: number;
};

export enum FrameType {
	DATA = 0x0,
	HEADERS = 0x1,
	PRIORITY = 0x2,
	RST_STREAM = 0x3,
	SETTINGS = 0x4,
	PUSH_PROMISE = 0x5,
	GOAWAY = 0x7,
	WINDOW_UPDATE = 0x8,
	CONTINUATION = 0x9,
}

export type Flag = {
	flag: number;
	data: any;
};

export enum GLOBAL_FLAG {
	END_STREAM = 0x0,
}
