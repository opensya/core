import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { copySync } from 'fs-extra';

export const copyLocales = function (config: OpensyaConfigOutput) {
  const projectDirs = getDirs(config);
  if (!projectDirs.root.server.locales.exists()) return;

  projectDirs.dist.server.locales.ensureExists();

  copySync(
    projectDirs.root.server.locales.dir,
    projectDirs.dist.server.locales.dir,
  );
};
