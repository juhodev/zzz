export function isNil(x: any) {
	return x === null || x === undefined;
}

export function hasBitSet(x: number, flag: number) {
	return (x & flag) === flag;
}

export function dec2bin(dec: number) {
	return (dec >>> 0).toString(2);
}
