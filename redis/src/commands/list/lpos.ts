import { Redis } from '../../redis';
import { ICommand } from '../command';
import { parsePairs } from '../../utils/parsePairs';
import { iter } from '../../utils/iter';

type Opts = {
  count: string;
  rank: string;
  maxlen: string;
};

export class LPos implements ICommand<number | number[] | undefined> {
  run(redis: Redis, ...args: string[]): number | number[] | undefined {
    const key = args.shift();
    const element = args.shift();

    if (key == null || element == null) {
      return -1;
    }

    const value = redis.get<string[]>(key);
    if (value == null) {
      return undefined;
    }

    const opts = parsePairs<Opts>(args);
    const optsLength = Object.keys(opts).length;
    if (optsLength === 0) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] !== element) {
          continue;
        }

        return i;
      }

      return undefined;
    }

    const maxLenNumber = opts.maxlen == null ? value.length : parseInt(opts.maxlen, 10);
    const rank = opts.rank == null ? 0 : parseInt(opts.rank, 10);
    const count = opts.count == null ? 1 : parseInt(opts.count, 10);
    
    const elementsFound: number[] = [];
    let elementsFoundCount = 0;
    for (const data of iter(value, maxLenNumber, rank < 0)) {
      if (data.value !== element) {
        continue;
      }

      elementsFoundCount++;
      if (rank !== 0 && elementsFoundCount < Math.abs(rank)) {
        continue;
      }

      elementsFound.push(data.index);
      if (count > 0 && elementsFound.length >= count) {
        break;
      }
    }

    if (elementsFound.length === 0) {
      return undefined;
    }

    if (count === 1) {
      return elementsFound[0];
    }

    return elementsFound;
  }
}
