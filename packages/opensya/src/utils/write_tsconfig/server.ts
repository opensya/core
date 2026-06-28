import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir, normalizeDirs } from "@opensya/utils";
import { getDirs, SERVER_DIRNAME } from "../dirs";

export function writeServerTsconfig() {
  const dirs = getDirs();

  const include: string[] = normalizeDirs([
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_SERVER, "**/*.ts")),
    relative(
      dirs.OUTPUT_DIR,
      join(dirs.INPUT_DIR, "modules/**", SERVER_DIRNAME, "**/*.ts"),
    ),

    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "server/**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "server/**/*.d.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_SERVER, "**/*.d.ts")),
  ]);

  const exclude: string[] = [];

  const paths = {
    "@@/*": [
      normalizeDir(relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR, "./*"))),
    ],

    "@core/server/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR_SERVER, "./*")),
      ),
    ],
    "@core/server": [
      normalizeDir(relative(dirs.OUTPUT_DIR, dirs.CORE_DIR_SERVER)),
    ],
  };

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

      paths,
    },

    include,
    exclude,
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.server.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
