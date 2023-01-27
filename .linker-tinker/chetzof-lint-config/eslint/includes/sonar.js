module.exports = {
  extends: ['plugin:sonarjs/recommended'],
  plugins: ['sonarjs'],
  rules: {
    'sonarjs/no-all-duplicated-branches': 'warn',
  },
}
