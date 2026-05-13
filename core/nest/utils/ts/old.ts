// import { MayBePromise } from '@opensya/share';
// import ts, { DiagnosticCategory } from 'typescript';
// import { writeTsconfig } from './tsconfig';
// import { getDirs } from '@opensya/config';
// import { replaceTscAliasPaths } from 'tsc-alias';
// import { relative } from 'node:path';
// import { TSCompilerPlugin } from './types';

// const logger = {
//   [DiagnosticCategory.Warning]: consola.warn,
//   [DiagnosticCategory.Error]: consola.error,
//   [DiagnosticCategory.Suggestion]: consola.info,
//   [DiagnosticCategory.Message]: consola.log,
// };

// type CompilerPluginContext = {
//   ts: typeof ts;
// };

// type CompilerPlugin = {
//   name: string;
//   transformFile?: (
//     fileName: string,
//     content: string,
//     context: CompilerPluginContext,
//   ) => MayBePromise<string>;
// };

// const template = `
// interface _Models {
//  {line}
// }

// declare module 'mongoose' {
//   interface Models extends _Models {}
// }

// declare global {
//   {line_2}
// }
// `;

// const appendCommentPlugin: CompilerPlugin = {
//   name: 'append-comment',

//   async transformFile(fileName, content) {
//     const dirs = getDirs();
//     if (!fileName.endsWith('.d.ts')) return content;

//     const rPAthFromDist = relative(dirs.output.server.dist.dir, fileName);
//     if (!rPAthFromDist.startsWith('kernel2/models')) return content;

//     const name = fileName.split('/').at(-1)!;
//     const modelName = name.replace(/.d.ts$/, '');
//     const fullImp = `import('mongoose').Model<${modelName}>;`;

//     const contentType = template
//       .replace('{line}', `${modelName}: ${fullImp}`)
//       .replace(
//         '{line_2}',
//         `function getModel(name: '${modelName}'): ${fullImp}`,
//       );

//     return `${content}\n${contentType}\n`;
//   },
// };

// export class TSCompiler {
//   onSuccess: () => void;

//   tsLoader: TypeScriptBinaryLoader;
//   tsConfigPath: string;
//   tsBin!: typeof ts;
//   watchProgram?: ts.WatchOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram>;

//   plugins: TSCompilerPlugin[] = [];

//   constructor(onSuccess: () => void) {
//     this.onSuccess = onSuccess;

//     const w = writeTsconfig();
//     this.tsLoader = new TypeScriptBinaryLoader();
//     this.tsConfigPath = w.path;
//   }

//   use(plugin: () => TSCompilerPlugin) {
//     this.plugins.push(plugin());
//     return this;
//   }

//   private getExtraTypeFiles() {
//     return this.plugins.flatMap((plugin) => plugin.types ?? []);
//   }

//   private getPriorityFiles() {
//     const priority = this.plugins.flatMap((plugin) => plugin.priority ?? []);
//     return priority;
//   }

//   private sortRootNames(fileNames: string[]) {
//     const priorityFiles = this.getPriorityFiles();
//     const extraTypeFiles = this.getExtraTypeFiles();

//     const unique = new Set<string>();

//     fileNames = [...extraTypeFiles, ...priorityFiles, ...fileNames].filter(
//       (fileName) => {
//         if (unique.has(fileName)) return false;
//         unique.add(fileName);
//         return true;
//       },
//     );

//     return fileNames;
//   }

//   private async prepare() {
//     this.tsBin = await this.tsLoader.load();

//     const configPath = this.tsBin.findConfigFile(
//       getDirs().output.server.dir,
//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       this.tsBin.sys.fileExists,
//       this.tsConfigPath,
//     );

//     if (!configPath) {
//       throw new Error(
//         `Could not find TypeScript configuration file "${this.tsConfigPath}". Please, ensure that you are running this command in the appropriate directory (inside Nest workspace).`,
//       );
//     }
//   }

//   async watch() {
//     const dirs = getDirs();
//     await this.prepare();

//     const createProgram =
//       this.tsBin.createEmitAndSemanticDiagnosticsBuilderProgram;

//     const host = this.tsBin.createWatchCompilerHost(
//       this.tsConfigPath,
//       {},
//       this.tsBin.sys,
//       createProgram,

//       (diagnostic) => {
//         if (diagnostic.file) {
//           const path = relative(process.cwd(), diagnostic.file.fileName);
//           console.log(path);
//         }

//         const messageText = diagnostic && diagnostic.messageText;
//         logger[diagnostic.category](messageText);
//       },

//       (diagnostic, newLine, options, errorCount) => {
//         const messageText = diagnostic && diagnostic.messageText;
//         logger[diagnostic.category](messageText);

//         if (errorCount === 0) void this.parseRoot().then(this.onSuccess);
//       },

//       { excludeDirectories: [dirs.output.dir] },
//     );

//     this.overrideCreateProgramFn(host);

//     this.watchProgram = this.tsBin.createWatchProgram(host);
//   }

//   overrideCreateProgramFn(
//     host: ts.WatchCompilerHostOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram>,
//   ) {
//     const origCreateProgram = host.createProgram;
//     const originalReadFile = host.readFile?.bind(host);

//     host.readFile = (fileName) => {
//       return originalReadFile?.(fileName);
//     };

//     host.createProgram = (tsConfigPath, options, host, oldProgram) => {
//       options ??= {};
//       options.rootNames = this.sortRootNames(options.rootNames ?? ([] as any));

//       const program = origCreateProgram(
//         tsConfigPath,
//         options,
//         host,
//         oldProgram,
//         undefined,
//         // projectReferences,
//       );
//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       const origProgramEmit = program.emit;

//       // program.emit = (
//       //   targetSourceFile,
//       //   writeFile,
//       //   cancellationToken,
//       //   emitOnlyDtsFiles,
//       //   customTransformers,
//       // ) => {
//       //   let transforms = customTransformers;
//       //   transforms = typeof transforms !== 'object' ? {} : transforms;

//       //   transforms.before ??= [];
//       //   transforms.after ??= [];
//       //   transforms.afterDeclarations ??= [];

//       //   transforms.afterDeclarations.push((context) => {
//       //     return {
//       //       transformBundle(node) {
//       //         return node;
//       //       },

//       //       transformSourceFile(node) {
//       //         const _newText = '// an example to test';

//       //         // TODO Ajouter le code pour ajouter <_newText> à la fin du fichier

//       //         return node;
//       //       },
//       //     };
//       //   });

//       //   return origProgramEmit(
//       //     targetSourceFile,
//       //     writeFile,
//       //     cancellationToken,
//       //     emitOnlyDtsFiles,
//       //     transforms,
//       //   );
//       // };

//       program.emit = (
//         targetSourceFile,
//         writeFile,
//         cancellationToken,
//         emitOnlyDtsFiles,
//         customTransformers,
//       ) => {
//         const pluginWriteFile: ts.WriteFileCallback = (
//           fileName,
//           data,
//           writeByteOrderMark,
//           onError,
//           sourceFiles,
//         ) => {
//           void this.applyPlugins(fileName, data).then((newData) => {
//             if (writeFile) {
//               writeFile(
//                 fileName,
//                 newData,
//                 writeByteOrderMark,
//                 onError,
//                 sourceFiles,
//               );
//               return;
//             }

//             this.tsBin.sys.writeFile(fileName, newData, writeByteOrderMark);
//           });
//         };

//         return origProgramEmit(
//           targetSourceFile,
//           pluginWriteFile,
//           cancellationToken,
//           emitOnlyDtsFiles,
//           customTransformers,
//         );
//       };

//       return program;
//     };
//   }

//   async build() {
//     await this.prepare();

//     const formatHost = {
//       getCanonicalFileName: (path: string) => path,
//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       getCurrentDirectory: this.tsBin.sys.getCurrentDirectory,
//       getNewLine: () => this.tsBin.sys.newLine,
//     };

//     const { options, fileNames, projectReferences } =
//       this.getByConfigFilename();

//     const createProgram =
//       this.tsBin.createIncrementalProgram || this.tsBin.createProgram;

//     const program = createProgram.call(ts, {
//       rootNames: fileNames,
//       projectReferences,
//       options,
//     });

//     const emitResult = program.emit();
//     const errorsCount = this.reportAfterCompilationDiagnostic(
//       program,
//       emitResult,
//       formatHost,
//     );

//     if (errorsCount) process.exit(1);
//     else if (!errorsCount) void this.parseRoot().then(this.onSuccess);
//   }

//   close() {
//     this.watchProgram?.close();
//   }

//   getByConfigFilename() {
//     const parsedCmd = this.tsBin.getParsedCommandLineOfConfigFile(
//       this.tsConfigPath,
//       undefined,
//       this.tsBin.sys as any,
//     );

//     if (!parsedCmd) throw new Error('error');

//     const { options, fileNames, projectReferences } = parsedCmd;
//     return { options, fileNames, projectReferences };
//   }

//   reportAfterCompilationDiagnostic(
//     program: ts.BuilderProgram,
//     emitResult: ts.EmitResult,
//     formatHost: ts.FormatDiagnosticsHost,
//   ) {
//     const diagnostics = this.tsBin
//       .getPreEmitDiagnostics(program as any)
//       .concat(emitResult.diagnostics);
//     if (diagnostics.length > 0) {
//       consola.error(
//         this.tsBin.formatDiagnosticsWithColorAndContext(
//           diagnostics,
//           formatHost,
//         ),
//       );
//       consola.info(
//         `Found ${diagnostics.length} error(s).` + this.tsBin.sys.newLine,
//       );
//     }
//     return diagnostics.length;
//   }

//   async parseRoot() {
//     await replaceTscAliasPaths({ configFile: this.tsConfigPath });
//   }

//   private async applyPlugins(fileName: string, content: string) {
//     let result = content;

//     for (const plugin of this.plugins) {
//       if (!plugin.transformFile) continue;

//       result = await plugin.transformFile(fileName, result, { ts: this.tsBin });
//     }

//     return result;
//   }
// }

// export class TypeScriptBinaryLoader {
//   tsBinary!: typeof ts;

//   async load() {
//     if (this.tsBinary) return this.tsBinary;

//     try {
//       const tsBinaryPath = require.resolve('typescript', {
//         paths: [getDirs().output.server.dir, ...this.getModulePaths()],
//       });
//       const tsBinary = await import(tsBinaryPath);
//       this.tsBinary = tsBinary;

//       return tsBinary as typeof ts;
//     } catch {
//       throw new Error(
//         'TypeScript could not be found! Please, install "typescript" package.',
//       );
//     }
//   }

//   getModulePaths() {
//     const modulePaths = module.paths.slice(2, module.paths.length);
//     const packageDeps = modulePaths.slice(0, 3);
//     return [
//       ...packageDeps.reverse(),
//       ...modulePaths.slice(3, modulePaths.length).reverse(),
//     ];
//   }
// }
