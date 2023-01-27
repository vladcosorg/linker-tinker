// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  overrides: [
    {
      files: ['*.ts', '*.js'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
      ],
      plugins: ['@typescript-eslint'],
      rules: {
        'node/no-missing-import': 'off',
        camelcase: 'off',
        '@typescript-eslint/member-ordering': 'warn',
        '@typescript-eslint/consistent-type-imports': 'warn',
        '@typescript-eslint/method-signature-style': 'warn',
        '@typescript-eslint/no-confusing-void-expression': 'warn',
        '@typescript-eslint/no-redundant-type-constituents': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        '@typescript-eslint/prefer-enum-initializers': 'warn',
        'no-return-await': 'off',
        '@typescript-eslint/return-await': 'warn',
        '@typescript-eslint/switch-exhaustiveness-check': 'warn',
        '@typescript-eslint/sort-type-constituents': 'warn',
        '@typescript-eslint/promise-function-async': 'warn',
        '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      },
    },
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'error',
      },
    },
    {
      files: ['*.test.ts'],
      rules: {
        '@typescript-eslint/require-await': 'off',
      },
    },
  ],
})
