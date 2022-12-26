// vite.config.ts

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.development.json'],
    }),
  ],
  clearScreen: true,
  test: {
    deps: {
      interopDefault: true,
    },
    clearMocks: true,
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
})
