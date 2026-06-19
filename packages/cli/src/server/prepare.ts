import { defineGlobals, writeTsconfig } from './utils';

export function prepare() {
  defineGlobals();
  writeTsconfig();
}
