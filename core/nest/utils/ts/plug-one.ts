import { join, relative, resolve } from 'node:path';
import { TSCompilerPlugin } from './types';
import { getDirs } from '@opensya/config';

export const opensyaTypesPlugin = function () {
  const plugin: TSCompilerPlugin = {
    name: 'opensya-types',

    // types: [
    //   join(getDirs().output.server.dir, 'types/global.d.ts'),
    //   join(getDirs().output.server.dir, 'types/compiler.d.ts'),
    // ],

    // priority: [join(getDirs().output.server.dir, 'types/global.d.ts')],

    transformFile(fileName, content, context) {
      const dirs = getDirs();
      if (!fileName.endsWith('.js')) return content;

      const rPAthFromDist = relative(dirs.output.server.dist.dir, fileName);
      if (!rPAthFromDist.startsWith('kernel2/models')) return content;

      console.log(resolve(getDirs().root.dir, rPAthFromDist));

      // const name = fileName.split('/').at(-1)!;
      // const modelName = name.replace(/.d.ts$/, '');
      // const fullImp = `import('mongoose').Model<${modelName}>;`;

      return content;
    },
  };

  return plugin;
};
