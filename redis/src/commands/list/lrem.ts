import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LRem implements ICommand<number> {
  run(redis: Redis, ...args: string[]): number {
    const key = args.shift();
    const count = parseInt(args.shift()!, 10);
    const element = args.shift();

    if (key == null || count == null || element == null) {
      return 0;
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return 0;
    }

    if (count === 0) {
      const newArray = value.filter((v) => v !== element);
      redis.set(key, newArray);
      return value.length - newArray.length;
    }

    if (count > 0) {
      let removedCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== element) {
          continue;
        }

        value.splice(i, 1);
        removedCount++;
        if (removedCount >= count) {
          break;
        }
      }

      return removedCount;
    }

    let removedCount = 0;
    for (let i = value.length - 1; i >= 0; i--) {
      if (value[i] !== element) {
        continue;
      }

      value.splice(i, 1);
      removedCount++;
      if (removedCount >= -count) {
        break;
      }
    }

    return removedCount;
  }
}
