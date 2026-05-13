import { createConnection, ConnectionStates, Connection } from 'mongoose';
import { Model } from '../../types';
import { randomUUID } from 'crypto';

let con: Connection;

const confidentialKey = randomUUID();
function getConfidential() {
  return confidentialKey;
}

export function registerModel(model: Model) {
  Reflect.defineMetadata(model.name, model, getConfidential);
}

export async function initDatabase() {
  if (con?.readyState === ConnectionStates.connected) return;

  const dbUrl = _env.NEST_DATABASE_URL;

  con = createConnection(dbUrl, {
    // maxPoolSize: 10,
    // serverSelectionTimeoutMS: 30_000,
    // socketTimeoutMS: 45_000,
  });

  const names = Reflect.getMetadataKeys(getConfidential) as string[];

  for (const name of names) {
    const model = Reflect.getMetadata(name, getConfidential) as Model;
    con.model(name, model.schema);
  }

  globalThis.getModel = function (name: string) {
    return con.models[name];
  };
}
