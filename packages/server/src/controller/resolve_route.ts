import type { HTTPMethods } from 'fastify';
import path from 'node:path';

const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
  'HEAD',
] satisfies HTTPMethods[];

export function resolveRouteFromFilePath(filePath: string): {
  path: string;
  method?: HTTPMethods;
} {
  let normalized = filePath.replaceAll('\\', '/');

  const ext = path.extname(normalized);
  normalized = normalized.slice(0, -ext.length);

  const segments = normalized.split('/');

  let last = segments.at(-1)!;
  let method: HTTPMethods | undefined;

  for (const httpMethod of HTTP_METHODS) {
    const suffix = `.${httpMethod.toLowerCase()}`;

    if (last.endsWith(suffix)) {
      method = httpMethod;
      last = last.slice(0, -suffix.length);
      segments[segments.length - 1] = last;
      break;
    }
  }

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

  return {
    path: '/' + routeSegments.join('/'),
    method,
  };
}
