import { ControllerManifest, ControllerOptions } from '@nest/types';
import { RequestMethod } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export function getControllerManifest(
  file: string,
  parent: string,
  options: ControllerOptions = {},
): ControllerManifest {
  const methods = Object.values(RequestMethod).filter((v) => _.isString(v));
  const methodRegex = new RegExp(
    `(.)(${methods.join('|').toLowerCase()})(.)(js|ts)$`,
  );

  const idx = [];

  const url = file
    .replace(parent, '')
    .replace(methodRegex, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/.(js)$/, '')
    .replace(/(\/?)index$/, '');

  function getPaths(paths?: string | string[]) {
    if (!paths) return [url];

    paths = Array.isArray(paths) ? paths : [paths];

    paths = paths.map((path) =>
      path.startsWith('/') ? path : `${url}/${path}`,
    );

    return paths;
  }

  const path = getPaths(options.path);
  idx.push(...path);

  let method = options.method;
  if (!method) method = (file.match(methodRegex)?.at(2) as 'get') ?? 'get';
  idx.push(method);

  function getName() {
    let name = options?.name;
    if (name?.length) return name;

    if (!options?.path?.length) return randomUUID();

    if (typeof options.path === 'string') name = options.path;
    else name = options.path.join('-');

    return _.kebabCase(name.replaceAll('/', '-'));
  }
  const name = options.name ?? getName();

  const manifest: ControllerManifest = {
    name,
    method,
    path,
    idx: idx.join('-'),
    file,
    parent,
  };

  return manifest;
}
