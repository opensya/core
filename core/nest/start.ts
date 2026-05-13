// import './utils/set-globals';

// import { MayBePromise } from '@opensya/share';
// import { loadConfig, normalizeDir } from '@opensya/config';
// import { getDirs } from '@opensya/config';
// import { execo, ExecoReturn } from './utils/execo';
// import {
//   copyFileSync,
//   copySync,
//   existsSync,
//   mkdirSync,
//   rmSync,
//   writeFileSync,
// } from 'fs-extra';
// import { join, relative, resolve } from 'node:path';
// import { TSCompiler } from './utils/ts-compiler';
// import { opensyaTypesPlugin } from './utils/ts-compiler/plug-one';
// import { writeTsconfig } from './utils';

// export type StartOptions = {
//   command: 'dev' | 'build' | 'prepare';
//   watch?: boolean;
// };

// export function start(
//   options: StartOptions,
//   { onbuild }: { onbuild?: () => MayBePromise<void> } = {},
// ) {
//   void loadConfig().then(async (config) => {
//     globalThis._config = config;

//     console.log(_config);

//     const dirs = getDirs();
//     globalThis._mainDir = dirs.output.server.dir;

//     let restartTimer: NodeJS.Timeout;
//     let tscProcess: TSCompiler | null = null;
//     let serverProcess: ExecoReturn | null = null;

//     let bootstrapDir = join(__dirname, 'bootstrap.js');
//     if (!existsSync(bootstrapDir)) {
//       bootstrapDir = join(dirs.output.server.dist.dir, 'core/bootstrap.js');
//     }

//     function clean() {
//       rmSync(dirs.output.server.dir, { recursive: true, force: true });
//     }

//     function ensureDist() {
//       if (!existsSync(dirs.output.server.dir)) {
//         mkdirSync(dirs.output.server.dir, { recursive: true });
//       }
//     }

//     function copyLocales() {
//       const localRoots = join(dirs.root.dir, 'locales');
//       const destDir = join(dirs.output.server.dist.dir, 'i18n');

//       if (!existsSync(localRoots)) return;
//       if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

//       copySync(localRoots, destDir);
//     }

//     function writeMainJs() {
//       const dirs = getDirs();

//       let bootstrapDir = resolve(__dirname, '../bootstrap.js');
//       if (!existsSync(bootstrapDir)) {
//         bootstrapDir = resolve(
//           dirs.output.server.dist.dir,
//           'core/bootstrap.js',
//         );
//       }

//       bootstrapDir = normalizeDir(
//         relative(dirs.output.server.dir, bootstrapDir),
//       );

//       const code = `"use strict";
//     const bootstrap_1 = require("${bootstrapDir}");
//     (0, bootstrap_1.bootstrap)(__dirname);
//     `;

//       writeFileSync(resolve(dirs.output.server.dir, 'main.js'), code);
//     }

//     async function build() {
//       tscProcess = new TSCompiler(onBuildSuccess);

//       tscProcess.use(opensyaTypesPlugin);

//       if (options.command === 'dev') await tscProcess.watch();
//       else await tscProcess.build();
//     }

//     function onBuildSuccess() {
//       void copyLocales();
//       void onbuild?.();

//       if (options.command === 'dev') start();
//     }

//     function start() {
//       if (restartTimer) clearTimeout(restartTimer);

//       restartTimer = setTimeout(() => {
//         void stop().then(() => {
//           setTimeout(() => {
//             void compileConfigFile(dirs.output.server.dir).then(() => {
//               void writeMainJs();
//               // console.clear();

//               void runMain();
//             });
//           }, 500);
//         });
//       }, 500);
//     }

//     async function runMain() {
//       await stop();
//       await _.sleep(500);

//       const mainPath = join(dirs.output.server.dir, 'main.js');
//       if (!existsSync(mainPath)) return;
//       if (!existsSync(bootstrapDir)) return;

//       const envFileName = config.server.envFile ?? '.server.env';
//       const envFilePath = resolve(process.cwd(), envFileName);

//       if (existsSync(envFilePath)) {
//         copyFileSync(envFilePath, resolve(dirs.output.server.dir, envFileName));
//       }

//       serverProcess = await execo(['node', mainPath], {
//         cwd: dirs.output.server.dir,
//       });
//     }

//     async function compileConfigFile(out: string) {
//       if (existsSync(dirs.opensyaConfigFile.dir)) {
//         await execo(
//           [
//             'tsc',
//             `${dirs.opensyaConfigFile.dir}`,
//             '--pretty',
//             '--noCheck',
//             `--outDir ${out}`,
//           ],
//           { cwd: dirs.output.server.dir, wait: true },
//         );
//       }
//     }

//     async function stop(quit = false) {
//       if (quit) tscProcess?.close();

//       if (!serverProcess) return true;
//       if (serverProcess.killed) return true;

//       // if (!isServerRunning) return true;

//       consola.start('stopping server ...');
//       serverProcess.kill('SIGTERM');

//       if (!serverProcess.killed) {
//         consola.error('Failed to stop server');
//         process.exit(1);
//       }

//       serverProcess = null;

//       consola.success('Server topped');

//       return true;
//     }

//     function onStop() {
//       process.on('SIGINT', () => {
//         void stop(true).then(() => process.exit(0));
//       });

//       process.on('SIGTERM', () => {
//         void stop(true).then(() => process.exit(0));
//       });
//     }

//     void clean();
//     void ensureDist();
//     void writeTsconfig();
//     void writeMainJs();
//     // void build();
//     // void onStop();
//   });
// }
