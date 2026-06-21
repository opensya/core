import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir } from "@opensya/utils";
import { getDirs } from "../dirs";

export function writeServerTsconfig() {
  const dirs = getDirs();

  const include: string[] = [
    normalizeDir(
      relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_SERVER, "**/*.ts")),
    ),

    normalizeDir(
      relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "server/**/*.ts")),
    ),
    normalizeDir(
      relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "server/**/*.d.ts")),
    ),

    normalizeDir(
      relative(
        dirs.OUTPUT_DIR,
        join(dirs.OUTPUT_DIR_SERVER, "types/**/*.d.ts"),
      ),
    ),
  ];

  const exclude: string[] = [];

  const tsconfig = {
    compilerOptions: {
      target: "es2023",
      lib: ["ES2023"],
      module: "esnext",
      types: ["node"],
      skipLibCheck: true,

      /* Bundler mode */
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      moduleDetection: "force",
      noEmit: true,

      /* Linting */
      noUnusedLocals: true,
      noUnusedParameters: true,
      erasableSyntaxOnly: true,
      noFallthroughCasesInSwitch: true,

      //  ---

      sourceMap: true,
      incremental: true,
      pretty: true,

      experimentalDecorators: true,
      emitDecoratorMetadata: true,

      composite: true,
      declaration: true,
    },

    include,
    exclude,
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.server.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
