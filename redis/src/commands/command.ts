import { Redis } from "../redis";

export interface ICommand<T> {
  run(redis: Redis, ...args: string[]): T;
}
