module.exports = {
  root: true,
  env: { node: true },
  parser: 'vue-eslint-parser',
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended',
    'prettier',
  ],
  globals: {
    globalThis: false,
  },
};
