import { existsSync, lstatSync, readdirSync, rmSync } from 'fs-extra';
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

void rmv(join(process.cwd(), 'core/utils'));
void rmv(join(process.cwd(), 'core/nest'));
void rmv(join(process.cwd(), 'playground/server'));
