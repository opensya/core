import { atomicWriteFile, getChildren } from '@opensya/utils';
import { existsSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { getDirs } from '../../utils';
import { generateCode, loadFile, builders } from 'magicast';
import chokidar from 'chokidar';

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
  await build();
  listen();
}

function listen() {
  if (!process.argv.includes('--dev')) return;

  const dirs = getDirs();
  const pagesDir = join(dirs.INPUT_DIR_CLIENT, 'pages');
  if (!existsSync(pagesDir)) return;

  chokidar
    .watch(pagesDir, {
      ignoreInitial: true,
      ignored: (path, stats) => {
        if (!stats?.isFile()) return false;

        const isAccept = path.endsWith('.jsx') || path.endsWith('.tsx');
        return !isAccept;
      },
    })
    .on('add', () => void build())
    .on('unlink', () => void build());
}

export async function build() {
  const dirs = getDirs();
  const mod = await loadFile(join(dirs.OUTPUT_DIR_CLIENT, 'routes.jsx'));
  const pagesDir = join(dirs.INPUT_DIR_CLIENT, 'pages');

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

  atomicWriteFile(resolve(dirs.OUTPUT_DIR_CLIENT, 'routes.jsx'), code);
}

function toImportPath(filePath: string) {
  const dirs = getDirs();
  const relativePath = relative(dirs.OUTPUT_DIR_CLIENT, filePath).replaceAll(
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
