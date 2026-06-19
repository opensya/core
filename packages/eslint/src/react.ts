import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import { withCore } from './base';
import globals from 'globals';

export const reactConfigs: Parameters<typeof defineConfig> = [
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],

    ...react.configs.flat.recommended,

    plugins: {
      'react-hooks': reactHooks as any,
      'react-refresh': reactRefresh,
    },

    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];

export function withCoreReact(...args: Parameters<typeof defineConfig>) {
  return withCore(...reactConfigs, ...args);
}
