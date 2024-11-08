import { RedisInteger } from '../../dataTypes/RedisInteger';
import { Redis } from '../../redis';
import { ICommand } from '../command';

export class RPush implements ICommand<RedisInteger> {
  run(redis: Redis, ...args: string[]): RedisInteger {
    const key = args.shift();
    if (key == null) {
      return new RedisInteger(0);
    }

    const oldData = redis.get<string[]>(key) || [];
    const newData = [...oldData, ...args];

    redis.set(key, newData);

    return new RedisInteger(newData.length);
  }
}
