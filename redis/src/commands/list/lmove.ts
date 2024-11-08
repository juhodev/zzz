import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LMove implements ICommand<string | undefined> {
  run(redis: Redis, ...args: string[]): string | undefined {
    const source = args.shift();
    const destination = args.shift();

    if (source == null || destination == null) {
      return undefined;
    }

    const sourceWhere = args.shift();
    const destinationWhere = args.shift();

    if (sourceWhere == null || destinationWhere == null) {
      return undefined;
    }

    const sourceData = redis.get<string[]>(source);
    if (sourceData == null) {
      return undefined;
    }

    let destinationData = redis.get<string[]>(destination);
    if (destinationData == null) {
      destinationData = [];
      redis.set(destination, destinationData);
    }

    let value: string | undefined;
    if (sourceWhere === 'LEFT') {
      value = sourceData.shift();
    } else {
      value = sourceData.pop();
    }

    if (value == null) {
      return undefined;
    }

    if (destinationWhere === 'LEFT') {
      destinationData.unshift(value);
    } else {
      destinationData.push(value);
    }

    return value;
  }
}
