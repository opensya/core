import { Schema } from 'mongoose';

export type ModelManifest = {
  file: string;
  name: string;
  schema: string;
};

export type Model = {
  name?: string;
  schema: Schema;
};
