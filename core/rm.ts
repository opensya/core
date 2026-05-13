import { existsSync, lstatSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

function rmv(root: string) {
  if (!existsSync(root)) return;

  const stats = lstatSync(root);
  if (stats.isDirectory()) {
    const dirs = readdirSync(root);
    for (const dir of dirs) {
      rmv(join(root, dir));
    }

    return;
  }

  if (
    root.endsWith('.js') ||
    root.endsWith('.js.map') ||
    root.endsWith('.d.ts')
  ) {
    rmSync(root);
  }
}

void rmv(join(process.cwd(), 'core/nest'));
