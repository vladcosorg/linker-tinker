// @ts-check
const { defineConfig } = require('eslint-define-config')
module.exports = defineConfig({
  parserOptions: {
    project: ['./tsconfig.test.json'],
  },
  extends: [
    'oclif',
    'oclif-typescript',
    './node_modules/chetzof-lint-config/eslint/index.js',
  ],
  overrides: [
    {
      files: 'src/commands/**/*.ts',
      rules: {
        'import/no-unused-modules': 'off',
      },
    },
  ],
})
