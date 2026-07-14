import { join, relative } from "node:path";
import { CLIENT_DIRNAME, getDirs, SERVER_DIRNAME } from "./dirs.js";
import { normalizeDir, normalizeDirs } from "./normalize-dir.js";
import { atomicWriteFile } from "./atomic-write-file.js";
import { getCustomConfigAliases } from "./get-config-alias.js";

/**
 * Returns the base compiler options shared across all tsconfig targets.
 * This avoids duplicating language, module, type-checking, and code quality settings.
 */
function getSharedCompilerOptions() {
  return {
    /* Language and runtime */
    target: "ES2022",
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
  };
}

/**
 * Generates the base tsconfig.json that other configurations will extend.
 */
export function writeBaseTsconfig() {
  const dirs = getDirs();

  const tsconfig = {
    compilerOptions: getSharedCompilerOptions(),
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}

/**
 * Generates tsconfig.app.json for the frontend/client environment.
 */
export function writeClientTsconfig() {
  const dirs = getDirs();

  const include: string[] = normalizeDirs([
    relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_CLIENT, "**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_CLIENT, "**/*.d.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_CLIENT, "**/*.vue")),

    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR, CLIENT_DIRNAME, "**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR, CLIENT_DIRNAME, "**/*.vue")),

    relative(
      dirs.OUTPUT_DIR,
      join(dirs.INPUT_DIR, "modules/**", CLIENT_DIRNAME, "**/*.ts"),
    ),
    relative(
      dirs.OUTPUT_DIR,
      join(dirs.INPUT_DIR, "modules/**", CLIENT_DIRNAME, "**/*.vue"),
    ),

    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "**/*.d.ts")),
  ]);

  // Default client path aliases (ensuring they are wrapped in arrays for tsconfig compliance)
  const defaultPaths = {
    "#app/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_CLIENT, "./*")),
      ),
    ],

    "@/*": [
      normalizeDir(relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "./*"))),
    ],
    "~/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_CLIENT, "./*")),
      ),
    ],
    "~~/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_SERVER, "./*")),
      ),
    ],
  };

  // Merge with custom aliases configured in Opensya layers
  const paths = {
    ...defaultPaths,
    ...getCustomConfigAliases(),
  };

  const tsconfig = {
    extends: "./tsconfig.json",
    compilerOptions: {
      lib: ["ES2022", "DOM"],
      paths,
      types: ["node", "vite/client"],
    },
    include,
    exclude: [],
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.app.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}

/**
 * Generates tsconfig.server.json for the backend/server environment.
 */
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
  ]);

  // Default server path aliases (ensuring they are wrapped in arrays for tsconfig compliance)
  const defaultPaths = {
    "#server/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.OUTPUT_DIR_SERVER, "./*")),
      ),
    ],
    "@/*": [
      normalizeDir(relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "./*"))),
    ],
    "~~/*": [
      normalizeDir(
        relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR_SERVER, "./*")),
      ),
    ],
  };

  // Merge with custom aliases configured in Opensya layers
  const paths = {
    ...defaultPaths,
    ...getCustomConfigAliases(),
  };

  const tsconfig = {
    extends: "./tsconfig.json",
    compilerOptions: {
      lib: ["ES2022"],
      paths,
    },
    include,
    exclude: [],
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.server.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}

/**
 * Generates tsconfig.node.json for tooling, configuration files, and build scripts.
 */
export function writeNodeTsconfig() {
  const dirs = getDirs();

  // Scans build tools, config files (vite.config.ts, opensya.config.ts) and scripts
  const include: string[] = normalizeDirs([
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR, "*.config.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR, "scripts/**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.INPUT_DIR, "tools/**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "**/*.ts")),
    relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "**/*.d.ts")),
  ]);

  const paths = {
    "@/*": [
      normalizeDir(relative(dirs.OUTPUT_DIR, join(dirs.CORE_DIR, "./*"))),
    ],
  };

  const tsconfig = {
    extends: "./tsconfig.json",
    compilerOptions: {
      lib: ["ES2022"],
      paths,
      types: ["node"],
    },
    include,
    exclude: [],
  };

  atomicWriteFile(
    join(dirs.OUTPUT_DIR, "tsconfig.node.json"),
    JSON.stringify(tsconfig, undefined, 2),
  );
}

/**
 * High-level runner to build the entire TypeScript project configuration.
 */
export function generateAllTsconfigs() {
  writeBaseTsconfig();
  writeClientTsconfig();
  writeServerTsconfig();
  writeNodeTsconfig();
}
