// import { join, resolve } from 'node:path';
// import { execo, ExecoReturn } from '@nest/utils/execo';
// import { TSCompiler } from '@nest/utils/ts-compiler/compiler';

// void (async function () {
//   const entryFile = resolve(process.cwd(), 'lib/core/nest/entry.js');
//   let restartTimer: NodeJS.Timeout;
//   let serverProcess: ExecoReturn | null = null;

//   const compiler = new TSCompiler(join(process.cwd(), 'tsconfig.json'), start);

//   function start() {
//     if (restartTimer) clearTimeout(restartTimer);

//     restartTimer = setTimeout(() => {
//       serverProcess?.kill('SIGTERM');
//       void execo(['node', entryFile], { cwd: join(process.cwd(), 'src') }).then(
//         (sub) => {
//           serverProcess = sub;
//         },
//       );
//     }, 500);
//   }

//   await compiler.watch();
// })();
