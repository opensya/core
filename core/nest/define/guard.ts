import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { registerGuard } from '../utils/guards/register';

globalThis.defineGuard = function (handler) {
  return {
    compiler: function (config: OpensyaConfigOutput, { file }) {
      const projectDirs = getDirs(config);
      const parent = projectDirs.root.server.guards.dir;

      const name = file
        .replace(parent, '')
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replaceAll('/', '.')
        .replace(/.(js|ts)$/, '')
        .replace(/(\/?)index$/, '');

      registerGuard(name, handler);
    },
  };
};
