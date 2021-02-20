export function isNil(x: any) {
	return x === null || x === undefined;
}

function bitSet(x: number, flag: number) {
	return (x & flag) === flag;
}
