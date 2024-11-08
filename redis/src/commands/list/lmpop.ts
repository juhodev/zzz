import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LMPop implements ICommand<[string, string[]] | undefined> {
  run(redis: Redis, ...args: string[]): [string, string[]] | undefined {
    const numkeys = parseInt(args.shift() || '0', 10);
    if (numkeys <= 0) {
      return undefined;
    }

    const keys = args.splice(0, numkeys);
    const where = args.shift();
    args.shift();
    const count = parseInt(args.shift() ?? '1', 10);

    for (const key of keys) {
      const value = redis.get<string[]>(key);
      if (value == null || value.length === 0) {
        continue;
      }

      if (where?.toUpperCase() === 'LEFT') {
        const values = value.splice(0, count);
        return [key, values];
      }

      if (where?.toUpperCase() === 'RIGHT') {
        const values = value.splice(value.length - count);
        return [key, values];
      }
    }

    return undefined;
  }
}
