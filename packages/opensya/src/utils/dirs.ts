import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { getOpensyaConfig } from "../config";

export const SERVER_DIRNAME = "server";
export const CLIENT_DIRNAME = "client";
export const OUTPUT_DIRNAME = ".opensya";

export interface OpensyaDirs {
  INPUT_DIR: string;
  INPUT_DIR_SERVER: string;
  INPUT_DIR_CLIENT: string;

  OUTPUT_DIR: string;
  OUTPUT_DIR_SERVER: string;
  OUTPUT_DIR_CLIENT: string;

  CORE_DIR: string;
  CORE_DIR_SERVER: string;
  CORE_DIR_CLIENT: string;
}

const dirs: { value?: OpensyaDirs } = {};

export function getDirs(): OpensyaDirs {
  if (dirs.value) return dirs.value;

  const config = getOpensyaConfig();

  const inputDir = join(process.cwd(), config.srcDir);
  const outputDir = join(process.cwd(), OUTPUT_DIRNAME);

  dirs.value = {
    INPUT_DIR: inputDir,
    INPUT_DIR_SERVER: join(inputDir, SERVER_DIRNAME),
    INPUT_DIR_CLIENT: join(inputDir, CLIENT_DIRNAME),

    OUTPUT_DIR: outputDir,
    OUTPUT_DIR_SERVER: join(outputDir, SERVER_DIRNAME),
    OUTPUT_DIR_CLIENT: join(outputDir, CLIENT_DIRNAME),

    CORE_DIR: join(import.meta.dirname, ".."),
    CORE_DIR_SERVER: join(import.meta.dirname, "../server"),
    CORE_DIR_CLIENT: join(import.meta.dirname, "../client"),
  };

  return dirs.value;
}

export function ensureOutput(): void {
  const { OUTPUT_DIR, OUTPUT_DIR_SERVER, OUTPUT_DIR_CLIENT } = getDirs();

  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(OUTPUT_DIR_SERVER, { recursive: true });
  mkdirSync(OUTPUT_DIR_CLIENT, { recursive: true });
}
