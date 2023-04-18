import { formatISO } from 'date-fns';
import { computed, ComputedRef, Ref } from 'vue';
import { useDevicePixelRatio, useElementBounding, useElementSize } from '@vueuse/core';
import { Image } from './commons-search/types';

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

export function toDateString(date: Date) {
  return formatISO(date, { representation: 'date' });
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
