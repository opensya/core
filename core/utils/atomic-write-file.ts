import {
  existsSync,
  renameSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { dirname } from 'node:path';

export function atomicWriteFile(path: string, content: string): void {
  const tmpPath = `${path}.tmp`;
  const oldPath = `${path}.old`;

  mkdirSync(dirname(path), { recursive: true });

  // Cleanup ancien état
  rmSync(tmpPath, { recursive: true, force: true });
  rmSync(oldPath, { recursive: true, force: true });

  // Écriture du nouveau fichier
  writeFileSync(tmpPath, content);

  // Sauvegarde ancien fichier
  if (existsSync(path)) {
    renameSync(path, oldPath);
  }

  // Activation nouveau fichier
  renameSync(tmpPath, path);

  // Suppression ancien fichier
  rmSync(oldPath, { recursive: true, force: true });
}
