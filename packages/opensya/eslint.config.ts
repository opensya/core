import { withCoreReact } from '@opensya/eslint';

export default withCoreReact({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
