import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, '../../vitest.setup.ts')],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    tsconfig: 'tsconfig.vitest.json',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@armai/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
})
