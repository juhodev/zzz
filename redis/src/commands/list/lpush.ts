import { RedisInteger } from '../../dataTypes/RedisInteger';
import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LPush implements ICommand<RedisInteger> {
  run(redis: Redis, ...args: string[]): RedisInteger {
    const key = args.shift();
    if (key == null) {
      return new RedisInteger(0);
    }

    const oldData = redis.get<string[]>(key) || [];
    const newData = [...args, ...oldData];

    redis.set(key, newData);

    return new RedisInteger(newData.length);
  }
}
