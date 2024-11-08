import { Redis } from '../redis';
import { ICommand } from './command';

export class Print implements ICommand<void> {
  run(redis: Redis, ...args: string[]): void {
    console.log(...args);
  }
}
