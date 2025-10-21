const js = require('@eslint/js');
const nodePlugin = require('eslint-plugin-node');
const promisePlugin = require('eslint-plugin-promise');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'readonly',
        require: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Electron globals
        electron: 'readonly',
        // ES2021 globals
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
      },
    },
    plugins: {
      node: nodePlugin,
      promise: promisePlugin,
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'no-console': 'off',
      'promise/always-return': 'warn',
      'promise/catch-or-return': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.min.js',
      'coverage/',
      '.cache/',
    ],
  },
];
