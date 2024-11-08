import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LSet implements ICommand<string> {
  run(redis: Redis, ...args: string[]): string {
    const key = args.shift();
    const index = args.shift();
    const element = args.shift();

    if (key == null || index == null || element == null) {
      return 'ERROR: Not enough arguments';
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return 'ERROR: Key does not exist';
    }

    const indexNumber = parseInt(index, 10);
    const indexToUse = indexNumber < 0 ? value.length + indexNumber : indexNumber;

    if (indexToUse < 0 || indexToUse >= value.length) {
      return 'ERROR: Index out of range';
    }

    value[indexToUse] = element;

    return 'OK';
  }
}
