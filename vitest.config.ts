/// <reference types="vitest" />

import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  clearScreen: false,
  plugins: [Vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
