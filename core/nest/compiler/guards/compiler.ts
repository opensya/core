import { DefineGuard } from '@nest/types';
import { acceptFileRegex } from '@nest/utils/accept-files';
import { getWhyleDefault } from '@nest/utils/get-whyle-default';
import { getDirs, OpensyaConfigOutput } from '@opensya/config';

export async function compiler(config: OpensyaConfigOutput) {
  const projectDirs = getDirs(config);
  if (!projectDirs.root.server.guards.exists()) return;

  const files = projectDirs.root.server.guards.getChildren({
    recursive: true,
    onlyFile: true,
    endWith: acceptFileRegex,
  });

  for (const file of files) await build(file.path);

  async function build(file: string) {
    const raw = await import(file);
    const guards = getWhyleDefault<ReturnType<DefineGuard>>(raw);
    if (!guards.compiler) return;

    guards.compiler(config, { file });
  }
}
