import { DefineMongoosePlugin } from '@core/nest/types/database';
import { acceptFileRegex } from '@nest/utils/accept-files';
import { getWhyleDefault } from '@nest/utils/get-whyle-default';
import { getProjectDirsv2, OpensyaConfigOutput } from '@opensya/config';

export async function compiler(config: OpensyaConfigOutput) {
  const projectDirs = getProjectDirsv2(config);
  if (!projectDirs.root.server.database.plugins.exists()) return;

  const files = projectDirs.root.server.database.plugins.getChildren({
    recursive: true,
    onlyFile: true,
    endWith: acceptFileRegex,
  });

  for (const file of files) await build(file.path);

  async function build(file: string) {
    const raw = await import(file);
    const plugin = getWhyleDefault<ReturnType<DefineMongoosePlugin>>(raw);
    if (!plugin.compiler) return;

    plugin.compiler(config);
  }
}
