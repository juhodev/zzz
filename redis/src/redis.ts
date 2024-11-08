import { EntryKey } from './stream/EntryKey';

export class Redis {
  private data: Map<string, unknown> = new Map();

  private sequenceNumber: number = 0;
  private idTimestamp: number = 0;

  constructor() {}

  createId(): EntryKey {
    const timestamp = Date.now();
    if (timestamp === this.idTimestamp) {
      this.sequenceNumber++;
    } else {
      this.sequenceNumber = 0;
      this.idTimestamp = timestamp;
    }

    return new EntryKey(timestamp, this.sequenceNumber);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key) as T;
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}
