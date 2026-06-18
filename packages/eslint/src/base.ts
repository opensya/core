import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import packageJson from 'eslint-plugin-package-json';
import globals from 'globals';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';

const configs: Parameters<typeof defineConfig> = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.opensya/**',
      '**/coverage/**',
    ],

    files: ['**/*.{js,ts,mjs,cjs}'],

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2024,
      },
    },

    plugins: { js },

    extends: [
      js.configs.recommended,

      tseslint.configs.recommendedTypeChecked,
      // tseslint.configs.strictTypeChecked,
      // tseslint.configs.stylisticTypeChecked,

      eslintPluginPrettierRecommended,
    ],

    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],

      'no-unused-vars': 'off',

      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',

      '@typescript-eslint/prefer-for-of': 'off',

      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
          tabWidth: 2,
          printWidth: 80,
        },
      ],
    },
  },

  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.opensya/**',
      '**/coverage/**',
    ],
    files: ['**/*.{js,ts,mjs,cjs,css,scss}'],
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: {
      // 'unicorn/prefer-module': 'error',
      'unicorn/import-style': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-for-loop': 'off',

      'unicorn/filename-case': [
        'warn',
        {
          cases: { kebabCase: true, snakeCase: true },
          ignore: [String.raw`^README\.md$`],
        },
      ],
    },
  },

  {
    extends: [packageJson.configs.recommended, packageJson.configs.stylistic],
    files: ['**/package.json**', 'package.json'],

    rules: {
      'package-json/order-properties': 'error',
      'package-json/sort-collections': 'error',

      'package-json/require-description': 'off',
      'package-json/require-license': 'off',
      'package-json/require-repository': 'off',
      'package-json/require-sideEffects': 'off',
      'package-json/require-attribution': 'off',
    },
  },
];

export function withCore(...arguments_: Parameters<typeof defineConfig>) {
  return defineConfig(...configs, ...arguments_);
}
