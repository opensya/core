import { withCoreReact } from './src';

export default withCoreReact({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});

// import react from "eslint-plugin-react";
// import globals from "globals";

// export default [
//   {
//     files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],

//     ...react.configs.flat.recommended,

//     languageOptions: {
//       ...react.configs.flat.recommended.languageOptions,
//       globals: {
//         ...globals.serviceworker,
//         ...globals.browser,
//       },
//     },

//     rules: {
//       "no-console": "error",
//     },
//   },
// ];
