import { getProjectDirsv2, useDir } from '@opensya/config';
import { acceptFileRegex } from '../utils/accept-files';
import { registerService, typeTemplate } from '../utils/services';
import { writeFileSync } from 'fs-extra';

globalThis.defineService = (handler) => {
  return {
    compiler: function (config, { file }: { file: string }) {
      const projectDirs = getProjectDirsv2(config);
      const parent = projectDirs.root.server.services.dir;

      const name = file
        .replace(parent, '')
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .replaceAll('/', '.')
        .replace(/.(js|ts)$/, '')
        .replace(/(\/?)index$/, '');

      async function service(...args: Parameters<typeof handler>) {
        // TODO exécution de middeleware d'entrée

        const ret = await handler(...args);

        // TODO exécition de middeware de sortie

        return ret;
      }

      registerService(name, service);
      writeType();

      function writeType() {
        if (!['factory', 'development'].includes(_env.CORE_ENV)) return;

        const dir = useDir({ dir: file.replace(acceptFileRegex, '') });
        const rPath = dir.relative.from.outputServerTypes();

        const content = typeTemplate
          .replaceAll('{import}', rPath)
          .replaceAll('{name}', name);

        writeFileSync(
          projectDirs.output.server.types.join.this(`service.${name}.d.ts`),
          content,
        );
      }
    },
  };
};
