// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  ignorePatterns: ['.eslintrc.js'],
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    './includes/eslint.js',
    './includes/typescript-eslint.js',
    './includes/vue.js',
    './includes/sonar.js',
    './includes/import.js',
    './includes/unused-imports.js',
    './includes/unicorn.js',
    './includes/promise.js',
    // './includes/canonical.js',
    './includes/json.js',
    'prettier',
  ],
  globals: {},
  rules: {},
  plugins: [],
})
