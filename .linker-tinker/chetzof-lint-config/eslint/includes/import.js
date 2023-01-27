module.exports = {
  overrides: [
    {
      files: ['*.vue', '*.js', '*.ts'],
      extends: ['plugin:import/recommended', 'plugin:import/typescript'],
      plugins: ['import'],
      rules: {
        'import/no-unresolved': 'error',
        'import/no-unused-modules': [
          'warn',
          {
            missingExports: true,
            unusedExports: true,
          },
        ],
        'import/no-default-export': 'error',
        'import/dynamic-import-chunkname': [
          'warn',
          {
            webpackChunknameFormat: '[a-zA-Z0-57-9-/_]+',
          },
        ],
        // 'import/extensions': [
        //   'warn',
        //   'always',
        //   { js: 'never', ts: 'never', vue: 'always' },
        // ],
        'import/newline-after-import': 'warn',
        'import/order': [
          'warn',
          {
            alphabetize: { order: 'asc' },
            groups: [
              'builtin',
              'external',
              'internal',
              'sibling',
              'parent',
              'index',
              'object',
              'type',
            ],
            'newlines-between': 'always',
            pathGroups: [
              {
                group: 'internal',
                pattern: '@/**',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['*.vue', '*.test.ts'],
      rules: {
        'import/no-default-export': 'off',
        'import/no-unused-modules': [
          'error',
          {
            missingExports: false,
            unusedExports: true,
          },
        ],
      },
    },
    {
      files: ['vitest.config.ts'],
      rules: {
        'import/no-default-export': 'off',
        'import/no-unused-modules': 'off',
      },
    },
  ],
  settings: {
    'import/extensions': ['.js', '.ts', '.vue'],
    'import/internal-regex': '^@/',
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
}
