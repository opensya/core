import {
  createConnection,
  ConnectionStates,
  Connection,
  Schema,
} from 'mongoose';
import { Model } from '../../types';
import { randomUUID } from 'crypto';
import { Env } from '@core/utils/env';
import { colorize } from 'consola/utils';

let con: Connection;

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

export function registerModel(model: Model<any>) {
  Reflect.defineMetadata(model.name, model, getConfidential);
}

export async function initDatabase() {
  if (con?.readyState === ConnectionStates.connected) return;

  const dbUrl = Env.secret<string>('NEST_DATABASE_URL');

  con = createConnection(dbUrl, {
    // maxPoolSize: 10,
    // serverSelectionTimeoutMS: 30_000,
    // socketTimeoutMS: 45_000,
  });

  const names = Reflect.getMetadataKeys(getConfidential) as string[];

  for (const name of names) {
    const model = Reflect.getMetadata(name, getConfidential) as Model<any>;

    const schema = new Schema(model.schema, {
      timestamps: true,
      ...(model.options ?? {}),
    });
    con.model(name, schema);

    logger.success(`Model ${colorize('green', name)} registred`, 'Model');
  }

  globalThis.getModel = function <T = unknown>(name: string): T {
    const model = con.models[name];

    if (!model) {
      throw new ModelNotFoundError(name);
    }

    return model as T;
  };
}

export class ModelNotFoundError extends Error {
  constructor(modelName: string) {
    super(`Model "${modelName}" not found`);
    this.name = 'ModelNotFoundError';
  }
}
