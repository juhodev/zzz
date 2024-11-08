import { IRedisType } from "./Types";

export class RedisString implements IRedisType {
  constructor(private value: string) {}

  get() {
    return this.value;
  }
}
