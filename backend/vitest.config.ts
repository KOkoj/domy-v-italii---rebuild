import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
