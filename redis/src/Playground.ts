import { Cmds } from './cmds';

const PRINT_AUTOMATICALLY = true;

export const runPlayground = (cmds: Cmds) => {
  const commands = XADD_TESTS;

  run(cmds, commands);
};

const run = (cmds: Cmds, cmdStrings: string | string[]) => {
  if (!Array.isArray(cmdStrings)) {
    cmdStrings = [cmdStrings];
  }

  for (const commands of cmdStrings) {
    const toRun = commands
      .split('\n')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

    let lastReturn: any;
    for (const cmd of toRun) {
      console.log(`redis> ${cmd}`);
      const [command, ...args] = cmd.split(' ');

      if (lastReturn != null) {
        for (const arg of args) {
          if (arg === '$') {
            args[args.indexOf(arg)] = lastReturn;
          }
        }
      }

      lastReturn = cmds.exec(command.toLocaleLowerCase(), ...args);
      if (PRINT_AUTOMATICALLY) {
        console.log(lastReturn?.toString?.());
        console.log('');
      }
    }
  }
};

/**
 * https://redis.io/docs/latest/commands/llen/
 */
const LLEN_COMMANDS = `
LPUSH mylist "World"
LPUSH mylist "Hello"
LLEN mylist
`;

/**
 * https://redis.io/docs/latest/commands/lpop/
 */
const LPOP_COMMANDS = `
RPUSH mylist "one" "two" "three" "four" "five"
LPOP mylist
LPOP mylist 2
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/rpush/
 */
const RPUSH_COMMANDS = `
RPUSH mylist "hello"
RPUSH mylist "world"
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/lrem/
 */
const LREM_COMMANDS = `
RPUSH mylist "hello"
RPUSH mylist "hello"
RPUSH mylist "foo"
RPUSH mylist "hello"
LREM mylist -2 "hello"
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/lindex/
 */
const LINDEX_COMMANDS = `
LPUSH mylist "World"
LPUSH mylist "Hello"
LINDEX mylist 0
LINDEX mylist -1
LINDEX mylist 3
`;

/**
 * https://redis.io/docs/latest/commands/linsert/
 */
const LINSERT_COMMANDS = `
RPUSH mylist "Hello"
RPUSH mylist "World"
LINSERT mylist BEFORE "World" "There"
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/lmove/
 */
const LMOVE_COMMANDS = `
RPUSH mylist "one"
RPUSH mylist "two"
RPUSH mylist "three"
LMOVE mylist myotherlist RIGHT LEFT
LMOVE mylist myotherlist LEFT RIGHT
LRANGE mylist 0 -1
LRANGE myotherlist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/lmpop/
 */
const LMPOP_COMMANDS = `
LMPOP 2 non1 non2 LEFT COUNT 10
LPUSH mylist "one" "two" "three" "four" "five"
LMPOP 1 mylist LEFT
LRANGE mylist 0 -1
LMPOP 1 mylist RIGHT COUNT 10
LPUSH mylist "one" "two" "three" "four" "five"
LPUSH mylist2 "a" "b" "c" "d" "e"
LMPOP 2 mylist mylist2 right count 3
LRANGE mylist 0 -1
LMPOP 2 mylist mylist2 right count 5
LMPOP 2 mylist mylist2 right count 10
`;

/**
 * https://redis.io/docs/latest/commands/lpos/
 */
const LPOS_COMMANDS = `
RPUSH mylist a b c d 1 2 3 4 3 3 3
LPOS mylist 3
LPOS mylist 3 COUNT 0 RANK 2
`;

/**
 * https://redis.io/docs/latest/commands/lpushx/
 */
const LPUSHX_COMMANDS = `
LPUSH mylist "World"
LPUSHX mylist "Hello"
LPUSHX myotherlist "Hello"
LRANGE mylist 0 -1
LRANGE myotherlist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/lset/
 */
const LSET_COMMANDS = `
RPUSH mylist "one"
RPUSH mylist "two"
RPUSH mylist "three"
LSET mylist 0 "four"
LSET mylist -2 "five"
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/ltrim/
 */
const LTRIM_COMMANDS = `
RPUSH mylist "one"
RPUSH mylist "two"
RPUSH mylist "three"
LTRIM mylist 1 -1
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/rpop/
 */
const RPOP_COMMANDS = `
RPUSH mylist "one" "two" "three" "four" "five"
RPOP mylist
RPOP mylist 2
LRANGE mylist 0 -1
`;

/**
 * https://redis.io/docs/latest/commands/rpushx/
 */
const RPUSHX_COMMANDS = `
RPUSH mylist "Hello"
RPUSHX mylist "World"
RPUSHX myotherlist "World"
LRANGE mylist 0 -1
LRANGE myotherlist 0 -1
`;

const XADD_TESTS = [
  `
XADD mystream 1526919030474-55 message "Hello,"
XADD mystream 1526919030474-56 message " World!"
XRANGE mystream 1526919030474-55 1526919030474-56 
  `,
];
