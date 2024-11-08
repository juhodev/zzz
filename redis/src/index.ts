import { Cmds } from './cmds';
import { LPush } from './commands/list/lpush';
import { Print } from './commands/print';
import { LRange } from './commands/list/lrange';
import { runPlayground } from './Playground';
import { LPop } from './commands/list/LPop';
import { LLen } from './commands/list/llen';
import { RPush } from './commands/list/rpush';
import { LRem } from './commands/list/lrem';
import { LIndex } from './commands/list/lindex';
import { LInsert } from './commands/list/linsert';
import { LMove } from './commands/list/lmove';
import { LMPop } from './commands/list/lmpop';
import { LPos } from './commands/list/lpos';
import { LPushx } from './commands/list/lpushx';
import { LSet } from './commands/list/lset';
import { LTrim } from './commands/list/ltrim';
import { RPop } from './commands/list/rpop';
import { RPushx } from './commands/list/rpushx';
import { XAdd } from './commands/stream/xadd';
import { XRange } from './commands/stream/xrange';

(() => {
  const cmds = new Cmds();
  cmds.register('print', new Print());

  cmds.register('lpush', new LPush());
  cmds.register('lrange', new LRange());
  cmds.register('lpop', new LPop());
  cmds.register('llen', new LLen());
  cmds.register('rpush', new RPush());
  cmds.register('lrem', new LRem());
  cmds.register('lindex', new LIndex());
  cmds.register('linsert', new LInsert());
  cmds.register('lmove', new LMove());
  cmds.register('lmpop', new LMPop());
  cmds.register('lpos', new LPos());
  cmds.register('lpushx', new LPushx());
  cmds.register('lset', new LSet());
  cmds.register('ltrim', new LTrim());
  cmds.register('rpop', new RPop());
  cmds.register('rpushx', new RPushx());

  cmds.register('xadd', new XAdd());
  cmds.register('xrange', new XRange());

  runPlayground(cmds);
})();
