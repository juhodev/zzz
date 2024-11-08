import { RedisArray } from '../../dataTypes/RedisArray';
import { Redis } from '../../redis';
import { EntryKey } from '../../stream/EntryKey';
import { RedisStream } from '../../stream/RedisStream';
import { ICommand } from '../command';

export class XRange implements ICommand<RedisArray> {
  run(redis: Redis, ...args: string[]): RedisArray {
    const key = args.shift();

    const start = args.shift();
    const end = args.shift();

    if (key == null || start == null || end == null) {
      return new RedisArray();
    }

    const value = redis.get<RedisStream>(key);
    if (value == null) {
      return new RedisArray();
    }

    let itemsToRead: number;
    const count = args.shift();
    if (count == null) {
      itemsToRead = value.length;
    } else {
      itemsToRead = parseInt(count, 10);
    }

    const startEntryKey = EntryKey.fromString(start);
    const endEntryKey = EntryKey.fromString(end);

    const result = new RedisArray();
    for (const entry of value) {
      if (entry.key.isBiggerOrEqual(startEntryKey) && entry.key.isSmallerOrEqual(endEntryKey)) {
        itemsToRead--;
        if (itemsToRead < 0) {
          break;
        }

        result.push(new RedisArray([entry.key.toString(), new RedisArray(entry.data)]));
      }
    }

    return result;
  }
}
