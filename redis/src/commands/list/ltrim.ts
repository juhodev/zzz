import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LTrim implements ICommand<string> {
  run(redis: Redis, ...args: string[]): string {
    const key = args.shift();
    const start = args.shift();
    const stop = args.shift();

    if (key == null || start == null || stop == null) {
      return "ERR wrong number of arguments for 'ltrim' command";
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return 'OK';
    }

    const startIndex = parseInt(start, 10);
    const stopIndex = parseInt(stop, 10);

    const startIndexToUse = startIndex < 0 ? value.length + startIndex : startIndex;
    const stopIndexToUse = stopIndex < 0 ? value.length + stopIndex : stopIndex;

    const newArray = value.slice(startIndexToUse, stopIndexToUse + 1);
    redis.set(key, newArray);

    return 'OK';
  }
}
