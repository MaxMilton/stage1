import eslint from '@eslint/js';
import mm from '@maxmilton/eslint-config';
import unicorn from 'eslint-plugin-unicorn';
import ts from 'typescript-eslint';

const OFF = 0;
const WARN = 1;
const ERROR = 2;

export default ts.config(
  eslint.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  unicorn.configs['flat/recommended'],
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: ERROR,
    },
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json'],
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TODO: Remove once String.raw doesn't crash bun macros
      'unicorn/prefer-string-raw': OFF,

      // somewhat unstable and not always useful
      '@typescript-eslint/no-unnecessary-type-parameters': WARN,

      // prefer to clearly separate Bun and DOM
      'unicorn/prefer-global-this': OFF,

      /* Performance and byte savings */
      // byte savings
      '@typescript-eslint/no-confusing-void-expression': WARN,
      // byte savings (but reduces debugging ability)
      '@typescript-eslint/restrict-plus-operands': WARN,
      // byte savings (but reduces debugging ability)
      '@typescript-eslint/restrict-template-expressions': WARN,
      // byte savings with same performance
      'prefer-template': WARN,
      // indexOf is faster
      '@typescript-eslint/prefer-includes': OFF,
      // worse for performance-critical code
      '@typescript-eslint/prefer-for-of': OFF,
      // alternatives offer byte savings and better performance
      '@typescript-eslint/prefer-string-starts-ends-with': OFF,
      // void return can be used for efficient code... but be careful!
      'consistent-return': WARN,
      // useful for compact and memory efficient code... but be careful!
      'no-cond-assign': OFF,
      // more compact at the cost of being harder to read... but be careful!
      'no-multi-assign': WARN,
      // can be used for efficient code... but be careful!
      'no-param-reassign': WARN,
      // byte savings
      'no-plusplus': OFF,
      // useful for compact and memory efficient code... but be careful!
      'no-return-assign': WARN,
      // byte savings + faster
      'unicorn/explicit-length-check': OFF,
      'unicorn/no-array-callback-reference': WARN,
      // forEach is often faster (in Chrome and Bun but not Firefox)
      'unicorn/no-array-for-each': OFF,
      // indexOf is faster (in Chrome)
      'unicorn/prefer-includes': OFF,
      // slower and worse browser support
      'unicorn/prefer-string-replace-all': OFF,
      // byte savings (minification doesn't currently automatically remove)
      'unicorn/switch-case-braces': [ERROR, 'avoid'],

      /* stage1 */
      // underscores in synthetic event handler names
      'no-underscore-dangle': OFF,
      'unicorn/prefer-add-event-listener': OFF,
      'unicorn/prefer-dom-node-append': OFF,
      'unicorn/prefer-query-selector': OFF,
    },
  },
  {
    files: ['build.ts'],
    rules: {
      'no-console': OFF,
    },
  },
  {
    ignores: ['**/*.bak', 'bench/**', 'coverage/**', 'dist/**'],
  },
);
