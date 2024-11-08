import { Redis } from '../../redis';
import { EntryKey } from '../../stream/EntryKey';
import { RedisStream } from '../../stream/RedisStream';
import { parsePairs } from '../../utils/parsePairs';
import { ICommand } from '../command';

const AUTOMATIC_GENERATION_CHAR = '*';

export class XAdd implements ICommand<string | undefined> {
  run(redis: Redis, ...args: string[]): string | undefined {
    const key = args.shift();
    if (key == null) {
      return undefined;
    }

    const noMkStream = args[1]?.toUpperCase() === 'NOMKSTREAM';
    if (noMkStream) {
      args.shift();
    }

    // TODO: MAXLEN/MINID

    const id = args.shift();
    if (id == null) {
      return undefined;
    }

    let entryId: EntryKey;
    if (id == '*') {
      entryId = redis.createId();
    } else {
      // TODO: This does not support -* for automatic sequence number
      entryId = EntryKey.fromString(id);
    }

    let stream = redis.get<RedisStream>(key);
    if (stream == null) {
      if (noMkStream) {
        return undefined;
      }

      stream = new RedisStream();
      redis.set(key, stream);
    }

    if (!stream.tryAdd(entryId, args)) {
      return undefined;
    }

    return entryId.toString();
  }
}
