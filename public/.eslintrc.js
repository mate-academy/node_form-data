module.exports = {
  extends: '@mate-academy/eslint-config',
  env: {
    jest: true,
    browser: true,
  },
  rules: {
    'no-proto': 0,
    'max-len': ['error', { code: 100 }],
  },
  parserOptions: {
    sourceType: "module",
  },
};
