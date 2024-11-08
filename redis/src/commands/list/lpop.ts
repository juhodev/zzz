import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LPop implements ICommand<string | string[] | undefined> {
  run(redis: Redis, ...args: string[]): string | string[] | undefined {
    const key = args.shift();
    if (key == null) {
      return undefined;
    }

    const value = redis.get<string[]>(key);
    if (args.length === 0) {
      return value?.pop();
    }

    const count = parseInt(args[0], 10);
    if (count < 0) {
      return value?.splice(0);
    }

    return value?.splice(0, count);
  }
}
