import { Flag } from './types';

class Flags {
	private flags: Map<number, Flag>;

	constructor() {
		this.flags = new Map();
	}

	add(flag: Flag): Flags {
		this.flags.set(flag.flag, flag);
		return this;
	}

	has(flag: number): boolean {
		return this.flags.has(flag);
	}

	get(flag: number): any {
		return this.flags.get(flag).data;
	}

	toNumber(): number {
		let flagsBits: number = 0;
		for (const flag of this.flags) {
			flagsBits |= 1 << flag[1].flag;
		}
		return flagsBits;
	}
}

export default Flags;
