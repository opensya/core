import { string, uuid } from "../../../../src/server";

export const id = uuid().defaultRandom().primary().require();

export const firstName = string().require();
export const lastName = string().require();

export const email = string().require();
export const password = string();
