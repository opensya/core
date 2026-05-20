import { EventEmitter } from 'node:events';

export const opensyaEvents = new EventEmitter();

export type ServerStartedPayload = {
  host: string;
  baseUrl: string;
  apiBaseUrl: string;
};
