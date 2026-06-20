import type { Plugin } from 'vite';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

export const prefix = /^\/?\$(virtual|output):/;
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];

export function viteOpensyaReactPlugin({
  coreDir,
  outputDir,
}: {
  coreDir: string;
  outputDir: string;
}): Plugin {
  return {
    name: 'vite-plugin-react-opensya',
    enforce: 'pre',

    resolveId(id) {
      if (process.platform === 'win32' && /^\.\.\/[A-Z]:/.test(id)) {
        return id.slice(3);
      }
      const match = id.match(prefix);
      if (!match) return;

      const aliasType = match[1];
      const virtualName = id.replace(prefix, '');

      const baseDir =
        aliasType === 'virtual'
          ? join(import.meta.dirname, 'virtual')
          : outputDir;
      const basePath = normalize(join(baseDir, virtualName));

      if (existsSync(basePath)) return basePath;

      if (!extname(basePath)) {
        for (const extension of extensions) {
          const filePath = `${basePath}${extension}`;

          if (existsSync(filePath)) {
            return filePath;
          }
        }
      }

      return;
    },
  };
}
