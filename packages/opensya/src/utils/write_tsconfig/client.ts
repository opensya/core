import { join, relative } from "node:path";
import { atomicWriteFile, normalizeDir, normalizeDirs } from "@opensya/utils";
import { CLIENT_DIRNAME, getDirs } from "../dirs";

export function writeClientTsconfig() {
  const dirs = getDirs();

  const include: string[] = normalizeDirs([
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_CLIENT)),

    relative(
      dirs.OUTPUT_DIR,
      join(dirs.INPUT_DIR, "modules", CLIENT_DIRNAME, "**/*.ts"),
    ),

    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "client/**/*.d.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "client/**/*.tsx")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "client/**/*.jsx")),
  ]);

  const exclude: string[] = [];

  const paths = {
    "@ui:*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR_CLIENT, "ui/*")),
      ),
    ],
  };

  const tsconfig = {
    compilerOptions: {
      target: "es2023",
      lib: ["ES2023", "DOM"],
      types: ["vite/client"],
      module: "esnext",
      skipLibCheck: true,

      /* Bundler mode */
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      moduleDetection: "force",
      noEmit: true,
      jsx: "react-jsx",

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
    join(dirs.OUTPUT_DIR, "tsconfig.client.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}
