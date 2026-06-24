// src/lib/api.ts

import { $fetch } from "ofetch";

export const $api = $fetch.create({
  credentials: "include",

  headers: {
    Accept: "application/json",
  },
});
