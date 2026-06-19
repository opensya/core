import { atomicWriteFile, getChildren } from '@core/utils';
import { existsSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { INPUT_DIR_CLIENT, OUTPUT_DIR_CLIENT } from '../../utils';
import { generateCode, loadFile, builders } from 'magicast';

const routeTemplate = `
  {
    path: '{{path}}',
    lazy: async () => {
      const module = await import('{{import}}');
      return { Component: module.default };
    },
  },
`;

export async function createRouter() {
  const mod = await loadFile(join(OUTPUT_DIR_CLIENT, 'router.jsx'));

  const pagesDir = join(INPUT_DIR_CLIENT, 'pages');
  let routes: string = '';

  if (existsSync(pagesDir)) {
    const pages = getChildren(pagesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(jsx|tsx)$/,
    });

    for (const page of pages) {
      const routePath = resolveRouteFromFilePath(pagesDir, page.path);
      const importPath = toImportPath(page.path);

      routes += routeTemplate
        .replaceAll('{{path}}', routePath)
        .replaceAll('{{import}}', importPath);
    }
  }

  mod.exports.routes = builders.raw(`[${routes}]`);
  const { code } = generateCode(mod);

  atomicWriteFile(resolve(OUTPUT_DIR_CLIENT, 'router.jsx'), code);
}

function toImportPath(filePath: string) {
  const relativePath = relative(OUTPUT_DIR_CLIENT, filePath).replaceAll(
    '\\',
    '/',
  );

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

export function resolveRouteFromFilePath(pagesDir: string, filePath: string) {
  let normalized = relative(pagesDir, filePath).replaceAll('\\', '/');

  const ext = extname(normalized);
  normalized = normalized.slice(0, -ext.length);

  const segments = normalized.split('/');

  const routeSegments = segments
    .filter((segment) => segment !== 'index')
    .map((segment) => {
      const catchAllMatch = /^\[\.\.\.(.+)\]$/.exec(segment);

      if (catchAllMatch) {
        return `:${catchAllMatch[1]}*`;
      }

      const optionalMatch = /^\[\[(.+)\]\]$/.exec(segment);

      if (optionalMatch) {
        return `:${optionalMatch[1]}?`;
      }

      const dynamicMatch = /^\[(.+)\]$/.exec(segment);

      if (dynamicMatch) {
        return `:${dynamicMatch[1]}`;
      }

      return segment;
    });

  return '/' + routeSegments.join('/');
}
