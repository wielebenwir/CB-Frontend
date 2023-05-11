import { describe, it, vi } from 'vitest';
import { nextTick, ref, watch } from 'vue';
import { iterSettled, delay, useDateCache } from '../src/util';

function getTime(date?: Date, ref?: Date) {
  return (date ?? new Date()).getTime() / 1000 - (ref ? ref.getTime() / 1000 : 0);
}

describe('iterSettled', () => {
  it(
    'Doesn’t block on empty promises',
    async ({ expect }) => {
      const start = new Date();
      for await (const _ of iterSettled([])) {
        // nothing to do
      }
      expect(getTime(start, new Date())).toBeCloseTo(0);
    },
    { timeout: 500 },
  );

  it('Doesn’t break on rejected promises', async ({ expect }) => {
    const result = new Set<number>();
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.reject(new Error('foo')),
      Promise.resolve(3),
      Promise.resolve(4),
    ];
    for await (const data of iterSettled(promises)) {
      if (data.status === 'fulfilled') {
        result.add(data.value);
      }
    }
    expect(result).toEqual(new Set([1, 2, 3, 4]));
  });

  it('Yields promises as soon as they’re resolved', async ({ expect }) => {
    const start = new Date();
    let index = 0;
    const promises = [delay(1, 'late hello'), Promise.resolve('hello')];
    for await (const data of iterSettled(promises)) {
      if (data.status === 'rejected') throw data.reason;
      if (index++ === 0) {
        expect(data.value).toEqual('hello');
        expect(getTime(start, new Date())).toBeCloseTo(0);
      } else {
        expect(data.value).toEqual('late hello');
      }
    }
  });
});

describe('useDateCache', () => {
  it('Only updates value when date time changes', async ({ expect }) => {
    const time = new Date().getTime();
    const timeRef = ref(new Date(time));
    const cachedRef = useDateCache(timeRef);
    const callback = vi.fn();
    watch([cachedRef], callback);
    timeRef.value = new Date(time);
    await nextTick();
    timeRef.value = new Date(time);
    await nextTick();
    timeRef.value = new Date(time + 1);
    await nextTick();
    timeRef.value = new Date(time + 1);
    await nextTick();
    timeRef.value = new Date(time);
    await nextTick();
    expect(callback.mock.calls).toHaveLength(2);
  });
});
