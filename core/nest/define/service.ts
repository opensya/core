import { colorize } from 'consola/utils';
import { getDirs, useDir } from '@opensya/config';
import { acceptFileRegex } from '../utils/accept-files';
import { registerService, typeTemplate } from '../utils/services';
import { atomicWriteFile } from '#core/utils/atomic-write-file';
import { syntheseTypes } from '../compiler/utils/types';

globalThis.defineService = (handler) => {
  return {
    compiler: function (config, { file }: { file: string }) {
      const projectDirs = getDirs(config);
      const parent = projectDirs.root.server.services.dir;

      const name = file
        .replace(parent, '')
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replaceAll('/', '.')
        .replace(/.(js|ts)$/, '')
        .replace(/(\/?)index$/, '');

      async function service(...args: Parameters<typeof handler>) {
        logger.start(
          `Executing service ${colorize('green', name)} ...`,
          'Service',
        );

        const ret = await handler(...args);

        logger.success(
          `${colorize('green', name)} service executed successfully`,
          'Service',
        );

        return ret;
      }

      registerService(name, service);
      writeType();

      function writeType() {
        if (!['factory', 'development'].includes(_env.CORE_ENV as any)) return;

        const dir = useDir({ dir: file.replace(acceptFileRegex, '') });
        const rPath = dir.relative.to(projectDirs.output.server.types.dir).dir;

        const content = typeTemplate
          .replaceAll('{import}', rPath)
          .replaceAll('{name}', name);

        atomicWriteFile(
          projectDirs.output.server.types.join(`service.${name}.d.ts`).dir,
          content,
        );
        syntheseTypes();
      }
    },

    handler,
  };
};
