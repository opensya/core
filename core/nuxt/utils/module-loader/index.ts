import { getDirs, loadConfig, OpensyaConfigOutput } from '@opensya/config';
import { nuxtEntry } from '../../entry';
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addPluginTemplate,
  defineNuxtModule,
  extendPages,
} from '@nuxt/kit';
import { readdirSync, readFileSync } from 'node:fs';
import {
  findNearestPackageJson,
  resolvePackageDir,
} from '../../../utils/resolve-package';
import { join, relative } from 'node:path';

export interface ModuleOptions {
  cwd: string;
}

function scanVueFiles(dir: string): string[] {
  const files: string[] = [];

  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, item.name);

    if (item.isDirectory()) {
      files.push(...scanVueFiles(fullPath));
      continue;
    }

    if (item.isFile() && /\.(vue|js|mjs)$/.test(item.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function fileToRoutePath(pagesDir: string, file: string): string {
  const relativePath = relative(pagesDir, file)
    .replace(/\.(vue|js|mjs)$/, '')
    .replace(/\\/g, '/');

  const path = relativePath
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
    .replace(/\[(.+?)\]/g, ':$1');

  return `/${path}`.replace(/\/$/, '') || '/';
}

function getPluginMode(file: string): 'client' | 'server' | 'all' {
  if (file.includes('.client.')) return 'client';
  if (file.includes('.server.')) return 'server';

  return 'all';
}

function pascalCase(value: string) {
  return value
    .replace(/\.(vue|js|mjs)$/, '')
    .split(/[/\\_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function getComponentName({
  file,
  componentsDir,
  prefix,
}: {
  file: string;
  componentsDir: string;
  prefix?: string;
}) {
  const relativePath = relative(componentsDir, file).replace(/\\/g, '/');

  const name = pascalCase(relativePath);

  return `${pascalCase(prefix || '')}${name}`;
}

async function registerModule(config: OpensyaConfigOutput) {
  if (config.modules) {
    for (const module of config.modules) {
      const dir = resolvePackageDir(module);
      const mConfig = await loadConfig(dir);

      await registerModule(mConfig);
    }
  }

  if (config.idx === _config.idx) return;
  if (config.client === false) return;

  const clientConf = config.client;

  let name = config.name;
  if (!name) {
    const pkg = findNearestPackageJson(config.cwd);
    if (pkg) {
      const { name: _name } = JSON.parse(
        readFileSync(pkg.packageJsonPath, 'utf-8'),
      ) as { name?: 'string' };

      name = _name;
    }
  }
  name ??= config.cwd.split('/').at(-1)!;
  name = name.replaceAll('/', '-').replaceAll(/[^a-zA-Z0-9_-]/g, '');

  const dirs = getDirs(config);

  // TODO à voir plus tard
  registerComponents();
  function registerComponents() {
    const componentsDir = dirs.root.client.join('components/globals');
    if (!componentsDir.exists()) return;

    const files = componentsDir.getChildren({
      onlyFile: true,
      endWith: /\.(js|mjs)$/,
      recursive: true,
    });

    if (!files.length) return;

    const prefix = clientConf.components?.prefix || name;

    addPluginTemplate({
      filename: dirs.output.client.components.join(`${name}.mjs`).dir,
      // `opensya/components/${name}.mjs`,
      getContents: () => {
        const imports: string[] = [];
        const registrations: string[] = [];

        files.forEach((file, index) => {
          const importName = `Component${index}`;
          const componentName = getComponentName({
            file: file.path,
            componentsDir: componentsDir.dir,
            prefix,
          });

          imports.push(`import ${importName} from '${file.path}'`);
          registrations.push(
            `nuxtApp.vueApp.component('${componentName}', ${importName})`,
          );
        });

        return `
${imports.join('\n')}

export default defineNuxtPlugin((nuxtApp) => {
${registrations.map((line) => `  ${line}`).join('\n')}
})
`;
      },
    });

    // addComponentsDir({
    //   path: componentsDir.dir,
    //   global: true,
    //   prefix: clientConf.components?.prefix || name,
    // });
  }

  registerPlugins();
  function registerPlugins() {
    const pluginsDir = dirs.root.client.join('plugins');
    if (!pluginsDir.exists()) return;

    const files = pluginsDir.getChildren({
      onlyFile: true,
      endWith: /\.(ts|js|mjs)$/,
      recursive: true,
    });

    for (const file of files) {
      addPlugin({ src: file.path, mode: getPluginMode(file.path) });
    }
  }

  registerComposables();
  function registerComposables() {
    const composablesDir = dirs.root.client.join('composables');
    if (!composablesDir.exists()) return;

    addImportsDir(composablesDir.dir);
  }

  registerPages();
  function registerPages() {
    const pagesDir = dirs.root.client.join('pages');
    if (!pagesDir.exists()) return;

    extendPages((pages) => {
      const files = scanVueFiles(pagesDir.dir);
      for (const file of files) {
        const routePath = fileToRoutePath(pagesDir.dir, file);
        const pageName =
          routePath
            .replace(/^\//, '')
            .replace(/\/$/, '')
            .replaceAll('/', '-') || 'index';

        const page = { name: pageName, path: routePath, file };

        const pageIdx = pages.findIndex((p) => p.name === pageName);
        if (pageIdx !== -1) pages[pageIdx] = page;
        else pages.push(page);
      }
    });
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: { configKey: 'opensya' },

  async setup() {
    const { config } = await nuxtEntry();
    await registerModule(config);
  },
});
