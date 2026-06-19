import { atomicWriteFile, getChildren } from '@core/utils';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

export function createRouter() {
  const pagesDir = join(process.cwd(), 'client/pages');
  const routes: string[] = [];

  if (existsSync(pagesDir)) {
    const pages = getChildren(pagesDir, {
      recursive: true,
      onlyFile: true,
      endWith: /\.(jsx|tsx)$/,
    });

    for (const page of pages) {
      const routePath = toRoutePath(pagesDir, page.path);
      const importPath = toImportPath(page.path);

      routes.push(`{
        path: '${routePath}',
        lazy: async () => {
          const module = await import('${importPath}');
          return { Component: module.default };
        },
      }`);
    }
  }

  const template = `import App from './App';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      ${routes.join(',\n      ')}
    ],
  },
]);
`;

  atomicWriteFile(resolve(_outputDir, 'router.jsx'), template);
}

function toRoutePath(pagesDir: string, filePath: string) {
  const routePath = relative(pagesDir, filePath)
    .replaceAll('\\', '/')
    .replace(/index\.(jsx|tsx)$/, '')
    .replace(/\.(jsx|tsx)$/, '')
    .replace(/\/index$/, '')
    .replaceAll(/\[([^\]]+)\]/g, ':$1');

  return routePath === '' ? '/' : routePath;
}

function toImportPath(filePath: string) {
  const relativePath = relative(_outputDir, filePath).replaceAll('\\', '/');

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}
