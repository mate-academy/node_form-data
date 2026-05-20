module.exports = {
  root: true,
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
  },
  plugins: ['jest'],
  rules: {
    'no-proto': 0,
  },
};
