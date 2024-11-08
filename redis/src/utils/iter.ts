export function* iter<T>(
  arr: T[],
  maxLength?: number,
  reverse: boolean = false,
): Generator<{ value: T; index: number }> {
  // @ts-expect-error I know what I'm doing
  const obj: { value: T; index: number } = {};

  if (!reverse) {
    const maxItems = maxLength ?? arr.length;
    for (let i = 0; i < maxItems; i++) {
      obj.value = arr[i];
      obj.index = i;
      yield obj;
    }
  }

  if (reverse) {
    const minIndex = arr.length - (maxLength ?? arr.length);
    for (let i = arr.length - 1; i >= minIndex; i--) {
      obj.value = arr[i];
      obj.index = i;
      yield obj;
    }
  }
}
