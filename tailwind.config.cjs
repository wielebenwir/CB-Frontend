/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        'base-0': 'var(--cb-layer-base-0-color)',
        'base-1': 'var(--cb-layer-base-1-color)',
        'base-2': 'var(--cb-layer-base-2-color)',
        'base-3': 'var(--cb-layer-base-3-color)',
        active: 'var(--cb-layer-active-color)',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
