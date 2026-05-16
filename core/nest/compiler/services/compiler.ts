import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { DefineService } from '@nest/types';
import { acceptFileRegex } from '@nest/utils/accept-files';
import { getWhyleDefault } from '@nest/utils/get-whyle-default';

export async function compiler(config: OpensyaConfigOutput) {
  const projectDirs = getDirs(config);
  if (!projectDirs.root.server.services.exists()) return;

  const files = projectDirs.root.server.services.getChildren({
    recursive: true,
    onlyFile: true,
    endWith: acceptFileRegex,
  });

  for (const file of files) await build(file.path);

  async function build(file: string) {
    const raw = await import(file);
    const service = getWhyleDefault<ReturnType<DefineService>>(raw);
    if (!service.compiler) return;

    service.compiler(config, { file });
  }
}
