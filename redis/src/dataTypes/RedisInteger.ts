import { IRedisType } from './Types';

export class RedisInteger implements IRedisType {
  constructor(private value: number) {}

  get() {
    return this.value;
  }

  toString() {
    return this.value.toString();
  }
}
