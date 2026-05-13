import fs from 'node:fs';
import { resolve } from 'node:path';

export type EnvValue = string | boolean | number;

export type EnvObject = Record<string, EnvValue>;

export type EnvValidator<T> = {
  parse(value: EnvValue | undefined, key: string): T;
  optional(): EnvValidator<T | undefined>;
  default(value: T): EnvValidator<NonNullable<T>>;
};

export type InferValidator<T> = T extends EnvValidator<infer R> ? R : never;

export type EnvDefinition = Record<
  string,
  EnvValidator<any> | (() => EnvValidator<any>)
>;

export type InferEnv<T extends EnvDefinition> = {
  [K in keyof T]: T[K] extends () => infer R
    ? InferValidator<R>
    : InferValidator<T[K]>;
};

export interface LoadEnvOptions {
  path?: string;

  /**
   * Filter variables by prefix
   */
  prefix?: string | string[];

  /**
   * Always include these keys
   * even if they do not match prefix
   */
  with?: string[];

  /**
   * Remove prefix from keys
   * APP_NAME -> NAME
   */
  trimPrefix?: boolean;

  /**
   * Inject parsed variables into process.env
   * Default: true
   */
  processEnv?: boolean;

  /**
   * Override existing process.env values
   * Default: true
   */
  overrideProcessEnv?: boolean;
}

export class Env {
  static schema = {
    any<T = any>() {
      return createValidator<T>((value) => {
        return value as T;
      });
    },

    string(options?: { format?: 'host' }) {
      return createValidator<string>((value, key) => {
        if (value === undefined || value === '') {
          throw new Error(`Missing env variable: ${key}`);
        }

        const parsed = String(value);

        if (options?.format === 'host' && !isValidHost(parsed)) {
          throw new Error(`Invalid host format for env variable: ${key}`);
        }

        return parsed;
      });
    },

    number() {
      return createValidator<number>((value, key) => {
        if (value === undefined || value === '') {
          throw new Error(`Missing env variable: ${key}`);
        }

        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
          throw new Error(`Invalid number for env variable: ${key}`);
        }

        return parsed;
      });
    },

    enum<const T extends readonly string[]>(values: T) {
      return createValidator<T[number]>((value, key) => {
        if (value === undefined || value === '') {
          throw new Error(`Missing env variable: ${key}`);
        }

        const parsed = String(value);

        if (!values.includes(parsed)) {
          throw new Error(
            `Invalid value for ${key}. Expected: ${values.join(', ')}`,
          );
        }

        return parsed; // as T[number];
      });
    },
  };

  /**
   * Load, validate and inject env variables
   */
  static runtime<T extends EnvDefinition>(
    definition: T,
    options: LoadEnvOptions = {},
  ): InferEnv<T> {
    options.processEnv ??= true;
    options.overrideProcessEnv ??= true;

    const env = this.create(definition, options);

    if (options.processEnv) {
      injectProcessEnv(env, {
        override: options.overrideProcessEnv,
      });
    }

    return env;
  }

  /**
   * Load and validate env variables
   */
  static create<T extends EnvDefinition>(
    definition: T,
    options: LoadEnvOptions = {},
  ): InferEnv<T> {
    const rawEnv = loadEnvFile(options);

    const parsedEnv = {} as InferEnv<T>;

    for (const key in definition) {
      const schemaOrFactory = definition[key];
      let schema: EnvValidator<any>;

      if (typeof schemaOrFactory === 'function') schema = schemaOrFactory();
      else schema = schemaOrFactory;

      parsedEnv[key] = schema.parse(
        rawEnv[key],
        key,
      ) as InferEnv<T>[typeof key];
    }

    return parsedEnv;
  }
}

function createValidator<T>(
  parser: (value: EnvValue | undefined, key: string) => T,
): EnvValidator<T> {
  return {
    parse: parser,

    optional() {
      return createValidator<T | undefined>((value, key) => {
        if (value === undefined || value === '') {
          return undefined;
        }

        return parser(value, key);
      });
    },

    default(defaultValue: T) {
      return createValidator<NonNullable<T>>((value, key) => {
        if (value === undefined || value === '') {
          return defaultValue as NonNullable<T>;
        }

        return parser(value, key) as NonNullable<T>;
      });
    },
  };
}

/**
 * Load and parse a .env file
 */
export function loadEnvFile(options: LoadEnvOptions = {}): EnvObject {
  options.path ??= '.env';

  const absolutePath = resolve(options.path);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Env file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');

  return parseEnv(content, options);
}

/**
 * Parse raw .env content
 */
export function parseEnv(
  content: string,
  options: LoadEnvOptions = {},
): EnvObject {
  const env: EnvObject = {};

  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    let key = line.slice(0, separatorIndex).trim();

    let value = line.slice(separatorIndex + 1).trim();

    if (!matchPrefix(key, options.prefix) && !matchWith(key, options.with)) {
      continue;
    }

    if (options.trimPrefix && options.prefix) {
      key = removePrefix(key, options.prefix);
    }

    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Support multiline values
    value = value.replace(/\\n/g, '\n');

    env[key] = castEnvValue(value);
  }

  return env;
}

function injectProcessEnv(
  env: Record<string, unknown>,
  options: {
    override?: boolean;
  } = {},
): void {
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] !== undefined && !options.override) {
      continue;
    }

    process.env[key] = stringifyEnvValue(value);
  }
}

function stringifyEnvValue(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function matchPrefix(key: string, prefix?: string | string[]): boolean {
  if (!prefix) {
    return true;
  }

  const prefixes = Array.isArray(prefix) ? prefix : [prefix];

  return prefixes.some((item) => key.startsWith(item));
}

function matchWith(key: string, withKeys?: string[]): boolean {
  if (!withKeys?.length) {
    return false;
  }

  return withKeys.includes(key);
}

function removePrefix(key: string, prefix: string | string[]): string {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];

  for (const item of prefixes) {
    if (key.startsWith(item)) {
      return key.slice(item.length);
    }
  }

  return key;
}

function castEnvValue(value: string): EnvValue {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (!Number.isNaN(Number(value)) && value.trim() !== '') {
    return Number(value);
  }

  return value;
}

function isValidHost(value: string): boolean {
  if (value === 'localhost') {
    return true;
  }

  return /^[a-zA-Z0-9.-]+$/.test(value);
}
