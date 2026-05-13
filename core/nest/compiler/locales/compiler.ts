import { getDirs, OpensyaConfigOutput } from '@opensya/config';

export const compiler = async function (config: OpensyaConfigOutput) {
  const projectDirs = getDirs(config);
  if (!projectDirs.root.server.locales.exists()) return;

  _nestConfig.i18nLocaleDirs.push(projectDirs.root.server.locales.dir);
};
