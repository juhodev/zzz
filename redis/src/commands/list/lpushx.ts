import { RedisInteger } from '../../dataTypes/RedisInteger';
import { Redis } from '../../redis';
import { ICommand } from '../command';
import { LPush } from './lpush';

export class LPushx implements ICommand<RedisInteger> {
  run(redis: Redis, ...args: string[]): RedisInteger {
    const key = args[0];
    if (key == null) {
      return new RedisInteger(0);
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return new RedisInteger(0);
    }

    return new LPush().run(redis, ...args);
  }
}
