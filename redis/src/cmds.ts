import { ICommand } from "./commands/command";
import { Redis } from "./redis";

export class Cmds {
  private commands: Map<string, ICommand<any>> = new Map();
  private redis: Redis = new Redis();

  constructor() {}

  register(key: string, command: ICommand<any>) {
    this.commands.set(key, command);
  }

  exec(key: string, ...args: string[]) {
    const command = this.commands.get(key);

    if (!command) {
      throw new Error(`Command ${key} not found`);
    }

    return command.run(this.redis, ...args);
  }
}
