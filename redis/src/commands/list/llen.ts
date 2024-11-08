import { RedisInteger } from '../../dataTypes/RedisInteger';
import { Redis } from '../../redis';
import { ICommand } from '../command';

export class LLen implements ICommand<RedisInteger> {
  run(redis: Redis, ...args: string[]): RedisInteger {
    const key = args[0];

    const value = redis.get<string[]>(key);
    if (value == null) {
      return new RedisInteger(0);
    }

    return new RedisInteger(value.length);
  }
}
