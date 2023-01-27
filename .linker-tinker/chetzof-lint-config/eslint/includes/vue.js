// @ts-check
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  overrides: [
    {
      files: ['*.vue', '*.js'],
      env: {
        'vue/setup-compiler-macros': true,
      },
      parser: 'vue-eslint-parser',
      extends: ['plugin:vue/vue3-recommended'],
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: require.resolve('@typescript-eslint/parser'),
      },
      plugins: ['vue'],
      rules: {
        'no-unused-vars': 'off',
        'vue/block-lang': [
          'error',
          {
            script: {
              lang: 'ts',
            },
            style: {
              lang: 'scss',
            },
          },
        ],
        'vue/v-on-handler-style': 'error',
        'vue/v-for-delimiter-style': 'error',
        'vue/static-class-names-order': 'warn',
        'vue/prefer-true-attribute-shorthand': 'error',
        'vue/prefer-separate-static-class': 'error',
        'vue/no-unused-properties': 'error',
        'vue/no-undef-properties': 'error',
        'vue/no-template-target-blank': 'error',
        'vue/no-required-prop-with-default': 'error',
        'vue/no-ref-object-destructure': 'error',
        'vue/no-duplicate-attr-inheritance': 'error',
        'vue/no-boolean-default': 'error',
        'vue/next-tick-style': 'error',
        'vue/html-button-has-type': 'error',
        'vue/define-props-declaration': 'error',
        'vue/define-macros-order': 'error',
        'vue/define-emits-declaration': 'error',
        'vue/custom-event-name-casing': 'error',
        'vue/component-name-in-template-casing': ['error', 'kebab-case'],
        'vue/component-api-style': 'error',
      },
    },
  ],
})
