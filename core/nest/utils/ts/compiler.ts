import { MayBePromise } from '@opensya/share';
import { relative } from 'node:path';
import ts from 'typescript';

const logger = {
  [ts.DiagnosticCategory.Warning]: console.warn,
  [ts.DiagnosticCategory.Error]: console.error,
  [ts.DiagnosticCategory.Suggestion]: console.info,
  [ts.DiagnosticCategory.Message]: console.log,
};

export class TSCompiler {
  onSuccess?: () => MayBePromise<void>;

  tsLoader: TypeScriptBinaryLoader;
  tsConfigPath: string;
  tsBin!: typeof ts;
  watchProgram?: ts.WatchOfConfigFile<ts.EmitAndSemanticDiagnosticsBuilderProgram>;
  parentDir: string;

  constructor(tsConfigPath: string, onSuccess?: () => MayBePromise<void>) {
    this.parentDir = tsConfigPath.split('/').slice(0, -1).join('/');

    this.onSuccess = onSuccess;

    this.tsLoader = new TypeScriptBinaryLoader(this.parentDir);
    this.tsConfigPath = tsConfigPath;
  }

  private async prepare() {
    this.tsBin = await this.tsLoader.load();

    const configPath = this.tsBin.findConfigFile(
      this.tsConfigPath,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.tsBin.sys.fileExists,
      this.tsConfigPath,
    );

    if (!configPath) {
      throw new Error(
        `Could not find TypeScript configuration file "${this.tsConfigPath}". Please, ensure that you are running this command in the appropriate directory (inside Nest workspace).`,
      );
    }
  }

  async watch() {
    await this.prepare();

    const createProgram =
      this.tsBin.createEmitAndSemanticDiagnosticsBuilderProgram;

    const host = this.tsBin.createWatchCompilerHost(
      this.tsConfigPath,
      {},
      this.tsBin.sys,
      createProgram,

      (diagnostic) => {
        if (diagnostic.file) {
          const path = relative(process.cwd(), diagnostic.file.fileName);
          console.log(path);
        }

        const messageText = diagnostic && diagnostic.messageText;
        logger[diagnostic.category](messageText);
      },

      (diagnostic, newLine, options, errorCount) => {
        const messageText = diagnostic && diagnostic.messageText;
        logger[diagnostic.category](messageText);

        if (errorCount === 0) void this.parseRoot().then(this.onSuccess);
      },

      { excludeDirectories: [] },
    );

    this.watchProgram = this.tsBin.createWatchProgram(host);
  }

  async build() {
    void this.watch().then(() => this.close());
  }

  close() {
    this.watchProgram?.close();
  }

  getByConfigFilename() {
    const parsedCmd = this.tsBin.getParsedCommandLineOfConfigFile(
      this.tsConfigPath,
      undefined,
      this.tsBin.sys as any,
    );

    if (!parsedCmd) throw new Error('error');

    const { options, fileNames, projectReferences } = parsedCmd;
    return { options, fileNames, projectReferences };
  }

  reportAfterCompilationDiagnostic(
    program: ts.BuilderProgram,
    emitResult: ts.EmitResult,
    formatHost: ts.FormatDiagnosticsHost,
  ) {
    const diagnostics = this.tsBin
      .getPreEmitDiagnostics(program as any)
      .concat(emitResult.diagnostics);
    if (diagnostics.length > 0) {
      console.error(
        this.tsBin.formatDiagnosticsWithColorAndContext(
          diagnostics,
          formatHost,
        ),
      );
      console.info(
        `Found ${diagnostics.length} error(s).` + this.tsBin.sys.newLine,
      );
    }
    return diagnostics.length;
  }

  async parseRoot() {
    // await replaceTscAliasPaths({ configFile: this.tsConfigPath });
  }
}

export class TypeScriptBinaryLoader {
  tsBinary!: typeof ts;
  parentDir: string;

  constructor(parentDir: string) {
    this.parentDir = parentDir;
  }

  async load() {
    if (this.tsBinary) return this.tsBinary;

    try {
      const tsBinaryPath = require.resolve('typescript', {
        paths: [this.parentDir, ...this.getModulePaths()],
      });
      const tsBinary = await import(tsBinaryPath);
      this.tsBinary = tsBinary;

      return tsBinary as typeof ts;
    } catch {
      throw new Error(
        'TypeScript could not be found! Please, install "typescript" package.',
      );
    }
  }

  getModulePaths() {
    const modulePaths = module.paths.slice(2, module.paths.length);
    const packageDeps = modulePaths.slice(0, 3);
    return [
      ...packageDeps.reverse(),
      ...modulePaths.slice(3, modulePaths.length).reverse(),
    ];
  }
}
