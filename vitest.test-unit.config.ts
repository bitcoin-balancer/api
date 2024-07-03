import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['/src/vitest-setup.ts'],
    fileParallelism: false,
    include: ['**/*.test-unit.ts'],
  },
});
