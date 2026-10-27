import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['server/tests/**/*.test.js', 'client/src/**/*.test.{js,jsx}'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
