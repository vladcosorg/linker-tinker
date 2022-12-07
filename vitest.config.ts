// vite.config.ts

import tsconfigPaths from 'vite-tsconfig-paths'
// eslint-disable-next-line node/no-missing-import
import { defineConfig } from 'vitest/config'

// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
  plugins: [tsconfigPaths()],
  clearScreen: true,
  test: {
    clearMocks: true,
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
})
