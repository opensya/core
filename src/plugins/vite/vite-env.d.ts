// declare module "virtual:providers" {
//   import type { ComponentType, ReactNode } from "react";
//   export const providers: ComponentType<{ children: ReactNode }>[];
// }

declare module "virtual:router" {
  import type { RouteRecordRaw } from "vue-router";
  export const routes: eadonly<RouteRecordRaw[]>;
}

declare module "virtual:components" {
  import type { Plugin } from "vue";
  export const componentsPlugin: Plugin;
}

declare module "virtual:plugins" {
  import type { Plugin } from "vue";
  export const plugins: Record<string, (ctx: { app: any }) => void>;
  export const pluginsPlugin: Plugin;
}

declare module "virtual:composables" {}

declare module "virtual:css" {}

// declare module "virtual:guards" {
//   import type { ComponentType, ReactNode } from "react";

//   export const guards: ComponentType<{ children: ReactNode }>[];
// }

// declare module "virtual:layouts" {
//   import type { ComponentType, ReactNode } from "react";

//   export const layouts: Record<string, ComponentType<{ children: ReactNode }>>;
// }
