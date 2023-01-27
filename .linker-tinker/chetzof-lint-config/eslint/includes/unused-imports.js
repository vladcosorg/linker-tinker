module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.js', '*.vue'],
      plugins: ['unused-imports'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'warn',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            vars: 'all',
            varsIgnorePattern: '^_',
          },
        ],
        'unused-imports/no-unused-imports-ts': 'warn',
        'unused-imports/no-unused-vars-ts': [
          'warn',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            vars: 'all',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
}
