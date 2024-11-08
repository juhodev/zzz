export class EntryKey {
  constructor(private timestamp: number, private sqNumber: number) {}

  get ts(): number {
    return this.timestamp;
  }

  get sequenceNumber(): number {
    return this.sqNumber;
  }

  isBigger(key: EntryKey): boolean {
    if (this.timestamp > key.timestamp) {
      return true;
    }

    if (this.timestamp === key.timestamp) {
      return this.sqNumber > key.sequenceNumber;
    }

    return false;
  }

  isBiggerOrEqual(key: EntryKey): boolean {
    if (this.isEqual(key)) {
      return true;
    }

    if (this.timestamp > key.timestamp) {
      return true;
    }

    if (this.timestamp === key.timestamp) {
      return this.sqNumber > key.sequenceNumber;
    }

    return false;
  }

  isSmaller(key: EntryKey): boolean {
    if (this.timestamp < key.timestamp) {
      return true;
    }

    if (this.timestamp === key.timestamp) {
      return this.sqNumber < key.sequenceNumber;
    }

    return false;
  }

  isSmallerOrEqual(key: EntryKey): boolean {
    if (this.isEqual(key)) {
      return true;
    }

    if (this.timestamp < key.timestamp) {
      return true;
    }

    if (this.timestamp === key.timestamp) {
      return this.sqNumber < key.sequenceNumber;
    }

    return false;
  }

  isEqual(key: EntryKey): boolean {
    return this.timestamp === key.timestamp && this.sqNumber === key.sequenceNumber;
  }

  toString(): string {
    return `${this.timestamp}-${this.sqNumber}`;
  }

  static fromString(str: string): EntryKey {
    const [timestamp, sqNumber] = str.split('-').map(Number);
    return new EntryKey(timestamp, sqNumber);
  }
}
