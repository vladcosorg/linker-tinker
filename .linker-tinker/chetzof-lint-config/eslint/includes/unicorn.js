// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  extends: 'plugin:unicorn/recommended',
  plugins: ['unicorn'],
  rules: {
    'unicorn/prefer-at': 'warn',
  },
  overrides: [
    {
      files: '.eslintrc.js',
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
    {
      files: '*.vue',
      rules: {
        'unicorn/prevent-abbreviations': [
          'error',
          {
            allowList: {
              props: true,
            },
          },
        ],
      },
    },
  ],
})
