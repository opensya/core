import { DefineController } from '@nest/types';
import { acceptFileRegex } from '@nest/utils/accept-files';
import { getWhyleDefault } from '@nest/utils/get-whyle-default';
import { getDirs, OpensyaConfigOutput } from '@opensya/config';

export async function compiler(config: OpensyaConfigOutput) {
  const projectDirs = getDirs(config);
  if (!projectDirs.root.server.controllers.exists()) return;

  const files = projectDirs.root.server.controllers.getChildren({
    recursive: true,
    onlyFile: true,
    endWith: acceptFileRegex,
  });

  for (const file of files) await build(file.path);

  async function build(file: string) {
    const raw = await import(file);
    const service = getWhyleDefault<ReturnType<DefineController>>(raw);
    if (!service.compiler) return;

    service.compiler(config, { file });
  }
}
