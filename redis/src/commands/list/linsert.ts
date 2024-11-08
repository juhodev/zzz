import { Redis } from '../../redis';
import { ICommand } from '../command';

const KEY_DOES_NOT_EXIST = 0;
const PIVOT_NOT_FOUND = -1;

export class LInsert implements ICommand<number> {
  run(redis: Redis, ...args: string[]): number {
    const key = args.shift();
    const beforeOrAfter = args.shift();
    const pivot = args.shift();
    const element = args.shift();

    if (key == null || beforeOrAfter == null || pivot == null || element == null) {
      return KEY_DOES_NOT_EXIST;
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return KEY_DOES_NOT_EXIST;
    }

    const pivotIndex = value.indexOf(pivot);
    if (pivotIndex === -1) {
      return PIVOT_NOT_FOUND;
    }

    if (beforeOrAfter === 'BEFORE') {
      value.splice(pivotIndex, 0, element);
      return value.length;
    }

    if (beforeOrAfter === 'AFTER') {
      value.splice(pivotIndex + 1, 0, element);
      return value.length;
    }

    return PIVOT_NOT_FOUND;
  }
}
