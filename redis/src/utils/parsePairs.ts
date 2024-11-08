export const parsePairs = <T extends {}>(args: string[]): Partial<T> => {
  const result: Partial<T> = {};

  for (let i = 0; i < args.length; i += 2) {
    result[args[i].toLowerCase()] = args[i + 1] as any;
  }

  return result;
};