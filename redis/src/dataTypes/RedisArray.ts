export class RedisArray {
  constructor(private items: unknown[] = []) {}

  get length(): number {
    return this.items.length;
  }

  push<T>(item: T): void {
    this.items.push(item);
  }

  get(index: number): unknown {
    return this.items[index];
  }

  *[Symbol.iterator](): Generator<unknown> {
    for (const item of this.items) {
      yield item;
    }
  }

  toString(depth: number = 0) {
    for (let i = 0; i < this.items.length; i++) {
      let depthStr = '';
      if (depth > 0) {
        depthStr = '  '.repeat(depth);
      }
      console.log(`${depthStr}${i + 1}) ${(this.items[i]?.toString as any)?.(depth + 1)}`);
    }
  }
}
