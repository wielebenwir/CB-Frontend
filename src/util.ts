import { addDays, formatISO, parseISO } from 'date-fns';
import { computed, ComputedRef, ref, Ref } from 'vue';
import { useDevicePixelRatio, useElementBounding, useElementSize } from '@vueuse/core';
import { Image } from './commons-search/types';

type FilterFunction<T> = (item: T, index?: number, iterable?: T[]) => boolean;

export function delay<T>(timeInSeconds: number, resolveTo: T): Promise<T>;
export function delay(timeInSeconds: number): Promise<undefined>;
export function delay(timeInSeconds: number, resolveTo = undefined) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(resolveTo);
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

export function groupBy<KeyType, ItemType>(
  iterable: ItemType[],
  keyFn: (item: ItemType) => KeyType,
) {
  const result = new Map<KeyType, ItemType[]>();
  for (const item of iterable) {
    const key = keyFn(item);
    const items = result.has(key) ? (result.get(key) as ItemType[]) : [];
    items.push(item);
    result.set(key, items);
  }
  return result;
}

export function useGroupBy<KeyType, ItemType>(
  iterable: Ref<ItemType[]>,
  keyFn: (item: ItemType) => KeyType,
): ComputedRef<Map<KeyType, ItemType[]>> {
  return computed(() => groupBy(iterable.value, keyFn));
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

export function toDateString(date: Date) {
  return formatISO(date, { representation: 'date' });
}

export function parseDate(date: string | undefined | null) {
  if (!date) return null;
  const _date = parseISO(date);
  return isNaN(_date.getTime()) ? null : _date;
}

export function enforceDateRange(date: Date | null, range: { min: Date; max: Date }) {
  return date && date.getTime() > range.min.getTime() && date.getTime() <= range.max.getTime()
    ? date
    : null;
}

export function isDateInDayRange(
  startDate: Date,
  endDate: Date,
  dateToCheck: Date,
  inclusive = false,
): boolean {
  startDate = new Date(startDate.getTime());
  endDate = new Date(endDate.getTime());
  // Set the start and end dates to the beginning of their respective day
  // so that we actually compare days and not date-times.
  startDate.setHours(0, 0, 0, 0);
  if (!inclusive) {
    endDate.setHours(0, 0, 0, 0);
  } else {
    endDate.setHours(23, 59, 59, 999);
  }

  return startDate <= dateToCheck && dateToCheck < endDate;
}

export function useBottom(element: Ref<undefined | HTMLElement | { $el: HTMLElement }>) {
  const realElement = computed<HTMLElement | undefined>(() => {
    if (!element.value) return;
    if (element.value instanceof HTMLElement) {
      return element.value;
    }
    return element.value.$el;
  });
  const { height } = useElementBounding(realElement);
  return computed<number | undefined>(() => {
    if (!realElement.value) return;
    return height.value + realElement.value.offsetTop;
  });
}

export function useImage(
  container: Ref<HTMLElement>,
  images: Ref<Image[]>,
  minWidthRatio = 0.85,
): ComputedRef<Image | undefined> {
  const { width } = useElementSize(container);
  const { pixelRatio } = useDevicePixelRatio();
  return computed(() => {
    const minWidth = Math.max(150, width.value * pixelRatio.value);
    // try to find an image that fit’s the minimum pixel ratio
    for (const image of images.value) {
      if (image.width / minWidth >= minWidthRatio) return image;
    }
    // fallback to the image with the largest resolution
    const sortedImages = [...images.value].sort((a, b) => {
      return a.width === b.width ? 0 : a.width > b.width ? 1 : -1;
    });
    return sortedImages.at(-1);
  });
}

export function useAsyncFunction<F extends (...args: never[]) => Promise<unknown>>(fn: F) {
  const isProcessing = ref(false);
  async function wrapper(...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> {
    isProcessing.value = true;
    try {
      return (await fn(...args)) as Awaited<ReturnType<F>>;
    } finally {
      isProcessing.value = false;
    }
  }
  return { fn: wrapper, isProcessing };
}

export function isNumber(arg: unknown) {
  return typeof arg === 'number' && !isNaN(arg);
}

export function partition<T>(iterable: T[], predicate: FilterFunction<T>) {
  const matchList: T[] = [];
  const noMatchList: T[] = [];
  for (const item of iterable) {
    if (predicate(item)) {
      matchList.push(item);
    } else {
      noMatchList.push(item);
    }
  }

  return [matchList, noMatchList];
}

export function createImageResolver(cache?: Map<string, Promise<string | undefined>>) {
  const _cache = cache ?? new Map<string, Promise<string>>();

  return async function resolveURL(url: string): Promise<string | undefined> {
    // We don’t need to resolve data urls. They can be used as-is.
    if (url.startsWith('data:image/')) return url;

    // First try the cache.
    if (_cache.has(url)) {
      const dataURL = await _cache.get(url);
      if (dataURL) return dataURL;
    }

    // No cache hit. Fetch the image.
    // eslint-disable-next-line no-async-promise-executor
    const promise = new Promise<string | undefined>(async (resolve) => {
      let res: Response;
      let blob: Blob;
      try {
        res = await fetch(url, { mode: 'no-cors', cache: 'force-cache' });
      } catch (e) {
        console.error('Could not initialize server connection while loading image', { url });
        return resolve(undefined);
      }

      if (!res.ok) {
        console.error('Could not load image. Server responded with error code.', { url, res });
        return resolve(undefined);
      }

      try {
        blob = await res.blob();
      } catch (e) {
        console.error('Could not transform server response to blob.', { url, res });
        return resolve(undefined);
      }
      const reader = new FileReader();
      reader.onerror = () => {
        console.error('Cannot read data URL from image blob', url);
        resolve(undefined);
      };
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
    _cache.set(url, promise);
    return await promise;
  };
}

export async function* iterSettled<T>(
  promises: Promise<T>[],
): AsyncGenerator<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }> {
  if (promises.length === 0) return;

  const iterMap = new Map<number, Promise<{ index: number } & ({ data: T } | { error: unknown })>>(
    promises.map((promise, index) => {
      return [
        index,
        new Promise((resolve) => {
          promise
            .then((data) => {
              resolve({ index, data });
            })
            .catch((error) => {
              resolve({ index, error });
            });
        }),
      ];
    }),
  );

  while (iterMap.size > 0) {
    const resolved = await Promise.race(iterMap.values());
    iterMap.delete(resolved.index);
    // AsyncGenerator semantics dictate that `yield` behaves as `yield await`.
    // This means that we cannot yield rejected promises, without the generator
    // aborting wherever it encounters the first rejected promise.
    // So we wrap the payload in a Promise.allSettled-like object.
    if ('data' in resolved) {
      yield { status: 'fulfilled', value: resolved.data };
    } else {
      yield { status: 'rejected', reason: resolved.error };
    }
  }
}

export function maxBy<T>(
  iterable: Iterable<T>,
  isAGreater: (a: T, b: T) => boolean,
): T | undefined {
  let maxItem;
  let index = 0;
  for (const item of iterable) {
    if (index++ === 0) {
      maxItem = item;
      continue;
    }
    if (!isAGreater(maxItem as T, item)) {
      maxItem = item;
    }
  }
  return maxItem;
}

export function* iterDates(end: Date) {
  let day = new Date();
  do {
    yield day;
    day = addDays(day, 1);
  } while (
    day.getDate() !== end.getDate() ||
    day.getMonth() !== end.getMonth() ||
    day.getFullYear() !== end.getFullYear()
  );
  yield day;
}

export function* getDateMonths(dates: Iterable<Date>) {
  let currentMonth: { ref: Date; numDays: number } | undefined;

  for (const date of dates) {
    if (!currentMonth || currentMonth.ref.getMonth() !== date.getMonth()) {
      if (currentMonth) yield currentMonth;
      currentMonth = { ref: date, numDays: 0 };
    }
    currentMonth.numDays++;
  }

  if (currentMonth) yield currentMonth;
}
