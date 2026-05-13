import { getDirsv2, useDir } from '@opensya/config';
import { readFileSync, writeFileSync } from 'fs-extra';

export function getManifest<T = Record<string, any>>(name: string) {
  const dirs = getDirsv2();
  const manifestFile = useDir({
    dir: dirs.output.dist.server.join.this(`${name}.manifest.json`),
  });

  if (!manifestFile.exists()) return;

  const manifests: Record<string, T> = JSON.parse(
    readFileSync(manifestFile.dir, 'utf-8'),
  );

  return manifests;
}

export function writeManifest<T = Record<string, any>>(
  name: string,
  manifest: T,
) {
  const dirs = getDirsv2();
  const manifestFile = useDir({
    dir: dirs.output.dist.server.join.this(`${name}.manifest.json`),
  });

  writeFileSync(manifestFile.dir, JSON.stringify(manifest, null, 2));

  return manifest;
}
