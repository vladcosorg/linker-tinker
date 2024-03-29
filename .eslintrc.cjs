// @ts-check
const { defineConfig } = require('eslint-define-config')
module.exports = defineConfig({
  "env": {
    "jest": true,
    "node": true
  },
  extends: [
    "@vladcos/eslint-config"
  ],
  "settings": {
    "import/parsers": {
      "@typescript-eslint/parser": [
        ".ts",
        ".tsx"
      ]
    },
    "import/resolver": {
      "node": {},
      "typescript": {
        "project": "./tsconfig.json",
        "alwaysTryTypes": true
      }
    }
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  overrides: [
    {
      files: ['src/index.ts', 'src/commands/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
        'import/no-unused-modules': 'off',
      },
    },
    {
      files: ['*.ts', '*.js'],
      rules: {
        'unused-imports/no-unused-imports':
          process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-console': 'off',
        'no-process-exit': 'off',
        'unicorn/no-process-exit': 'off',
        '@typescript-eslint/no-inferrable-types': [
          'error',
          { ignoreParameters: true },
        ],
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.development.json',
      },
    },
  ],
})
