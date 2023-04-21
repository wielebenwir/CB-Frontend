import { describe, it } from 'vitest';
import { iterSettled, delay } from '../src/util';

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
