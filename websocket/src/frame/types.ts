export enum Opcode {
	CONTINUATION_FRAME = 0x0,
	TEXT_FRAME = 0x1,
	BINARY_FRAME = 0x2,
	// 0x3 - 0x7 are reserved for further non-control frames
	CONNECTION_CLOSE = 0x8,
	PING = 0x9,
	PONG = 0xa,
	// 0xB - 0xF are reserved for further control frames
}
