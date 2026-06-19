import { withCoreReact } from '@core/eslint';

export default withCoreReact({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
