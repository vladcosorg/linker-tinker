// @ts-check
const { defineConfig } = require('eslint-define-config')
module.exports = defineConfig({
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
