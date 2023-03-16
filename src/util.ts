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
