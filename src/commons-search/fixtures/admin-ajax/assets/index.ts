const _assets: Record<string, { default: string }> = import.meta.glob('./*', { eager: true });
export default Object.fromEntries(
  Object.entries(_assets).map(([filename, module]) => {
    return [filename.substring(2), module.default];
  }),
);
