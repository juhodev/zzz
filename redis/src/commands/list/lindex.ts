import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LIndex implements ICommand<string | undefined> {
  run(redis: Redis, ...args: string[]): string | undefined {
    const key = args.shift();
    if (key == null) {
      return undefined;
    }

    const index = parseInt(args[0], 10);
    if (isNaN(index)) {
      return undefined;
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return undefined;
    }

    if (index < 0) {
      return value[value.length + index];
    }

    return value[index];
  }
}
