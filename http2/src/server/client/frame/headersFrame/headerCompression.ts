import * as HPACK from 'hpack';

export function compress(headers: string[][]) {
	return new HPACK().encode(headers);
}

export function decompress(headerBuffer: Buffer): string[][] {
	return new HPACK().decode([...headerBuffer]);
}
