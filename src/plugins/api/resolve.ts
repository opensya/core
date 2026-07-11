import type { HTTPMethods } from "fastify";
import { extname, relative } from "node:path";
import _ from "lodash";

export interface ApiMetaOptions {
  method: HTTPMethods;
  url: string;
  file: string;
  idx: string;
  name: string;
}

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
] satisfies HTTPMethods[];

export function resolveApi(parentDir: string, file: string): ApiMetaOptions {
  let normalized = relative(parentDir, file).replaceAll("\\", "/");

  const ext = extname(normalized);
  normalized = normalized.slice(0, -ext.length);

  const segments = normalized.split("/");

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

  method ??= "GET";

  const routeSegments = segments
    .filter((segment) => segment !== "index")
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

  routeSegments.unshift("api");
  const url = "/" + routeSegments.join("/");
  const idx = _.snakeCase(`${url}_${method}`);
  const name = _.camelCase(idx);

  return {
    method,
    url,
    file,
    idx,
    name,
  };
}
