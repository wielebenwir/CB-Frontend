import * as _layouts from './_layouts';

export type LayoutType = keyof typeof layouts;
export const layouts = _layouts;
export const layoutNames: LayoutType[] = Object.keys(layouts) as LayoutType[];
