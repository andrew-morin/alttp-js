module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  root: true,
  rules: {
    'comma-dangle': ['warn', 'only-multiline'],
    'eol-last': ['error', 'always'],
    indent: ['error', 2, { SwitchCase: 1, VariableDeclarator: 2 }],
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': ['error', { "allow": ["methods"] }],
    'no-implicit-globals': 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    semi: 'error'
  }
};