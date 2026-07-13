import { join, relative } from "node:path";
import { getDirs, SERVER_DIRNAME } from "../dirs.js";
import { normalizeDir, normalizeDirs } from "../normalize-dir.js";
import { atomicWriteFile } from "../atomic_write_ile.js";

export function writeServerTsconfig() {
  const dirs = getDirs();

  const include: string[] = normalizeDirs([
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_SERVER, "**/*.ts")),
    relative(
      dirs.OUTPUT_DIR,
      join(dirs.INPUT_DIR, "modules/**", SERVER_DIRNAME, "**/*.ts"),
    ),

    relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_SERVER, "**/*.d.ts")),

    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "**/*.d.ts")),

    // relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "server/*/*.d.ts")),
    // relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_SERVER, "**/*.d.ts")),
  ]);

  const exclude: string[] = [];

  const paths = {
    "#server/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_SERVER, "./*")),
      ),
    ],

    "#core/*": [
      normalizeDir(relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "./*"))),
    ],
  };

  const tsconfig = {
    compilerOptions: {
      /* Language and runtime */
      target: "ES2022",
      lib: ["ES2022"],
      jsx: "preserve",
      allowJs: true,
      useDefineForClassFields: true,

      /* Modules and imports */
      module: "NodeNext",
      moduleResolution: "NodeNext",
      moduleDetection: "force",
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      isolatedModules: true,
      resolveJsonModule: true,
      esModuleInterop: true,

      /* Decorators */
      experimentalDecorators: true,
      emitDecoratorMetadata: true,

      /* Type checking */
      strict: true,
      noUncheckedIndexedAccess: true,
      exactOptionalPropertyTypes: true,
      noImplicitOverride: true,

      /* Code quality */
      noFallthroughCasesInSwitch: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      forceConsistentCasingInFileNames: true,
      erasableSyntaxOnly: true,
      skipLibCheck: true,

      /* Output */
      noEmit: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      pretty: true,

      /* Project references and cache */
      composite: true,
      incremental: true,

      // tsBuildInfoFile: ".tsbuildinfo",

      /* Path aliases */
      paths,

      /* Global type definitions */
      // types: ["node"],
    },

    include,
    exclude,
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.server.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
