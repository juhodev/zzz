import { FrameType } from './server/client/frame/types';

export function isNil(x: any) {
	return x === null || x === undefined;
}

export function hasBitSet(x: number, flag: number) {
	return (x & (1 << flag)) != 0;
}

export function dec2bin(dec: number) {
	return (dec >>> 0).toString(2);
}

export function prettifyFrameName(type: number): string {
	switch (type) {
		case FrameType.DATA:
			return 'DATA';

		case FrameType.GOAWAY:
			return 'GOAWAY';

		case FrameType.HEADERS:
			return 'HEADERS';

		case FrameType.PRIORITY:
			return 'PRIORITY';

		case FrameType.PUSH_PROMISE:
			return 'PUSH_PROMISE';

		case FrameType.RST_STREAM:
			return 'RST_STREAM';

		case FrameType.SETTINGS:
			return 'SETTINGS';

		default:
			return 'COULD NOT PRETTIFY (' + type + ')';
	}
}
