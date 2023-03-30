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

export function useMap<KeyType extends keyof ItemType, ItemType>(
  iterable: Ref<Iterable<ItemType>>,
  key: KeyType,
): ComputedRef<Map<ItemType[KeyType], ItemType>> {
  return computed(() => {
    const result = new Map<ItemType[KeyType], ItemType>();
    for (const item of iterable.value) {
      result.set(item[key], item);
    }
    return result;
  });
}

export function isDateInDayRange(startDate: Date, endDate: Date, dateToCheck: Date): boolean {
  startDate = new Date(startDate.getTime());
  endDate = new Date(endDate.getTime());
  // Set the start and end dates to the beginning of their respective day
  // so that we actually compare days and not date-times.
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  return startDate <= dateToCheck && dateToCheck < endDate;
}
