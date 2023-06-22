import * as layouts from './_layouts';
export * from './_layouts';

export type LayoutType = keyof typeof layouts;
export const layoutNames: LayoutType[] = Object.keys(layouts) as LayoutType[];
