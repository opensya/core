import { getProjectDirsv2, OpensyaConfigOutput } from '@opensya/config';

export const compiler = async function (config: OpensyaConfigOutput) {
  const projectDirs = getProjectDirsv2(config);
  if (!projectDirs.root.server.locales.exists()) return;

  _nestConfig.i18nLocaleDirs.push(projectDirs.root.server.locales.dir);
};
