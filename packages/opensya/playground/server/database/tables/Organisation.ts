import { string, uuid } from "../../../../src/server";

export const id = uuid().primary();
export const name = string().require();
