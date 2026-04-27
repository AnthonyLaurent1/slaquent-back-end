module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  globals: {
    process: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-unused-vars': ['warn', { args: 'after-used', ignoreRestSiblings: true }],
  },
};
