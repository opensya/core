import { join, relative } from 'node:path';
import { atomicWriteFile, normalizeDir } from '@core/utils';
import { existsSync, mkdirSync } from 'node:fs';
import { getDirs } from '../../utils';

const template = `type Service = (typeof import("{{import}}"))['default']['service'];

declare global {
  function useService(name: '{{name}}'): Service;
}

export {};
`;

export function writeType(filePath: string, { name }: { name: string }) {
  const dirs = getDirs();

  if (!existsSync(join(dirs.OUTPUT_DIR_SERVER, 'types'))) {
    mkdirSync(join(dirs.OUTPUT_DIR_SERVER, 'types'));
  }

  const rPath = normalizeDir(
    relative(join(dirs.OUTPUT_DIR_SERVER, 'types'), filePath),
  );

  const content = template
    .replaceAll('{{import}}', rPath)
    .replaceAll('{{name}}', name);

  atomicWriteFile(
    join(dirs.OUTPUT_DIR_SERVER, 'types', `service.${name}.d.ts`),
    content,
  );
}
