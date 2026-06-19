import { join, relative } from 'node:path';
import { atomicWriteFile, normalizeDir } from '@core/utils';
import { OUTPUT_DIR_SERVER } from '../../utils';
import { existsSync, mkdirSync } from 'node:fs';

const template = `type Service = (typeof import("{{import}}"))['default']['service'];

declare global {
  function useService(name: '{{name}}'): Service;
}

export {};
`;

export function writeType(filePath: string, { name }: { name: string }) {
  if (!existsSync(join(OUTPUT_DIR_SERVER, 'types'))) {
    mkdirSync(join(OUTPUT_DIR_SERVER, 'types'));
  }

  const rPath = normalizeDir(
    relative(join(OUTPUT_DIR_SERVER, 'types'), filePath),
  );

  const content = template
    .replaceAll('{{import}}', rPath)
    .replaceAll('{{name}}', name);

  atomicWriteFile(
    join(OUTPUT_DIR_SERVER, 'types', `service.${name}.d.ts`),
    content,
  );
}
