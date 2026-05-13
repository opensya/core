import { getDirs, OpensyaConfigOutput, useDir } from '@opensya/config';
import { syntheseTypes } from '@nest/compiler/utils/types';
import { Model } from '@nest/types';
import { acceptFileRegex } from '@nest/utils/accept-files';
import { getWhyleDefault } from '@nest/utils/get-whyle-default';
import { typeTemplate } from '@nest/utils/models';
import { writeFileSync } from 'fs-extra';
import { registerModel } from '@nest/utils/database';

export async function compiler(config: OpensyaConfigOutput) {
  const projectDirs = getDirs(config);
  if (!projectDirs.root.server.models.exists()) return;

  const files = projectDirs.root.server.models.getChildren({
    recursive: true,
    onlyFile: true,
    endWith: acceptFileRegex,
  });

  for (const file of files) await build(file.path);

  async function build(file: string) {
    const raw = await import(file);
    const model = getWhyleDefault<Model>(raw);

    if (!model?.schema) return;

    const fileName = file.split('/').at(-1)!;
    model.name ??= fileName.replace(acceptFileRegex, '');

    registerModel(model);
    writeTypes();

    function writeTypes() {
      if (!['factory', 'development'].includes(_env.CORE_ENV)) return;

      const dirs = getDirs(_config);
      const dir = useDir({ dir: file.replace(acceptFileRegex, '') });
      const rPath = dir.relative.from(dirs.output.server.dir);

      const content = typeTemplate
        .replaceAll('{import}', `${rPath}`)
        .replaceAll('{name}', model.name!);

      writeFileSync(
        projectDirs.output.server.types.join(
          `model.${model.name!.toLocaleLowerCase()}.d.ts`,
        ),
        content,
      );

      syntheseTypes();
    }
  }
}
