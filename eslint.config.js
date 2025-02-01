const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  { plugins: { '@nx': nxEslintPlugin } },
  ...compat
    .config({ plugins: ['unused-imports', 'simple-import-sort'] })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignores: ['**/node_modules/**', '**/dist/**'],
      rules: {
        ...config.rules,
        '@nx/enforce-module-boundaries': [
          'error',
          {
            enforceBuildableLibDependency: true,
            banTransitiveDependencies: true,
            allow: [],
            depConstraints: [
              {
                sourceTag: '*',
                onlyDependOnLibsWithTags: ['*'],
              },
            ],
          },
        ],
        'no-duplicate-imports': 'error',
        'no-empty': 'error',
        'no-fallthrough': 'error',
        'no-param-reassign': 'error',
        'no-unreachable': 'error',
        'no-unreachable-loop': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'no-return-await': 'error',
        'require-await': 'error',
        'require-yield': 'error',
        'simple-import-sort/imports': [
          'error',
          { groups: [['^\\u0000'], ['^@?\\w'], ['^'], ['^\\.']] },
        ],
        'simple-import-sort/exports': 'error',
      },
    })),
  ...compat.config({ extends: ['plugin:@nx/typescript'] }).map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    rules: {
      ...config.rules,
      'no-extra-semi': 'off',
    },
  })),
  ...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      ...config.rules,
      'no-extra-semi': 'off',
    },
  })),
  ...compat.config({ env: { jest: true } }).map((config) => ({
    ...config,
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
    rules: {
      ...config.rules,
    },
  })),
];
