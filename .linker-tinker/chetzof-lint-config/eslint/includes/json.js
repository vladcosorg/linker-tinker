module.exports = {
  overrides: [
    {
      files: ['*.json', '*.json5', '*.jsonc'],
      extends: [
        'plugin:jsonc/recommended-with-json',
        'plugin:json-schema-validator/recommended',
        'plugin:jsonc/prettier',
      ],
      parser: 'jsonc-eslint-parser',
    },
  ],
}
