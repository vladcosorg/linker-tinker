module.exports = {
  extends: ['plugin:canonical/recommended', 'canonical/prettier'],
  // extends: ['canonical', 'canonical/prettier'],
  // rules: {
  //   'canonical/filename-match-exported': 'off',
  // },
  plugins: ['canonical'],
  overrides: [
    {
      extends: ['canonical/typescript'],
      files: '*.ts',
    },
  ],
}
