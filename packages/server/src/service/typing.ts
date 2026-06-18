import { join, relative } from 'node:path';
import { atomicWriteFile } from '../utils/atomic_write_ile';
import { normalizeDir } from '@core/utils';

const template = `type Service = (typeof import("{{import}}"))['default']['service'];

declare global {
  function useService(name: '{{name}}'): ReturnType<Service>;
}

export {};
`;

export function writeType(filePath: string, { name }: { name: string }) {
  const rPath = normalizeDir(relative(join(_outputDir, 'types'), filePath));
  const content = template
    .replaceAll('{{import}}', rPath)
    .replaceAll('{{name}}', name);

  atomicWriteFile(join(_outputDir, 'types', `service.${name}.d.ts`), content);
}
