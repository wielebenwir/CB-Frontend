import { computed, ComputedRef, Ref } from 'vue';

export function delay(timeInSeconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, timeInSeconds * 1000);
  });
}

export async function asyncIterableToArray<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}

export function useGroupBy<KeyType, ItemType>(
  iterable: Ref<ItemType[]>,
  keyFn: (item: ItemType) => KeyType,
): ComputedRef<Map<KeyType, ItemType[]>> {
  return computed(() => {
    const result = new Map<KeyType, ItemType[]>();
    for (const item of iterable.value) {
      const key = keyFn(item);
      const items = result.has(key) ? (result.get(key) as ItemType[]) : [];
      items.push(item);
      result.set(key, items);
    }
    return result;
  });
}
