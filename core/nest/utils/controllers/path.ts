import { RequestMethod } from '@nestjs/common';

export function getMehtodRegex() {
  const methods = Object.values(RequestMethod)
    .filter((v) => _.isString(v))
    .map((method) => method.toLowerCase());

  const methodRegex = new RegExp(`\\.(${methods.join('|')})\\.(js|ts)$`, 'i');

  return methodRegex;
}

export function buildControllerUrl(
  filePath: string,
  controllersDir: string,
): string {
  return filePath
    .replace(controllersDir, '')
    .replace(getMehtodRegex(), '')
    .replace(/\.(js|ts)$/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/(\/)?index$/, '');
}

export function normalizeRoutePath(path: string): string {
  const normalized = path
    .replace(/\/+/g, '/')
    .replace(/\[([a-zA-Z0-9_]+)\]/g, ':$1')
    .replace(/\/$/, '');

  return normalized || '/';
}

export function buildRoutePaths(
  basePath: string,
  paths?: string | string[],
): string[] {
  if (!paths) {
    return [normalizeRoutePath(basePath)];
  }

  const inputPaths = Array.isArray(paths) ? paths : [paths];

  return inputPaths.map((path) => {
    const routePath = path.startsWith('/') ? path : `${basePath}/${path}`;

    return normalizeRoutePath(routePath);
  });
}
