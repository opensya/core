// declare module "virtual:providers" {
//   import type { ComponentType, ReactNode } from "react";
//   export const providers: ComponentType<{ children: ReactNode }>[];
// }

declare module "virtual:router" {
  import type { RouteRecordRaw } from "vue-router";
  export const routes: eadonly<RouteRecordRaw[]>;
}

// declare module "virtual:guards" {
//   import type { ComponentType, ReactNode } from "react";

//   export const guards: ComponentType<{ children: ReactNode }>[];
// }

// declare module "virtual:style";

// declare module "virtual:layouts" {
//   import type { ComponentType, ReactNode } from "react";

//   export const layouts: Record<string, ComponentType<{ children: ReactNode }>>;
// }
