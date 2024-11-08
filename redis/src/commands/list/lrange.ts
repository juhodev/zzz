import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LRange implements ICommand<string[]> {
  run(redis: Redis, ...args: string[]): string[] {
    const key = args[0];

    const start = parseInt(args[1], 10);
    const end = parseInt(args[2], 10);

    const data = redis.get<string[]>(key) || [];
    if (data.length === 0) {
      return data;
    }

    const startIndex = start < 0 ? data.length + start : start;
    const endIndex = end < 0 ? data.length + end : end;

    return data.slice(startIndex, endIndex + 1);
  }
}
