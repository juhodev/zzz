import { EntryKey } from './EntryKey';

type StreamEntry<T> = {
  key: EntryKey;
  data: string[];
};

export class RedisStream {
  private entries: StreamEntry<unknown>[] = [];

  get length(): number {
    return this.entries.length;
  }

  tryAdd<T>(key: EntryKey, data: string[]): boolean {
    if (!this.isIncrementingKey(key)) {
      return false;
    }

    this.entries.push({ key, data });
    return true;
  }

  *[Symbol.iterator](): Generator<StreamEntry<unknown>> {
    for (const entry of this.entries) {
      yield entry;
    }
  }

  private isIncrementingKey(key: EntryKey): boolean {
    const lastKey = this.entries[this.entries.length - 1]?.key;
    if (lastKey == null) {
      return true;
    }

    return key.isBigger(lastKey);
  }
}
