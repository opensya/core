declare module "virtual:routes" {
  import type { RouteRecordRaw } from "vue-router";
  export const routes: readonly RouteRecordRaw[];
}

declare module "virtual:router-middlewares" {
  import type { RouteMiddleware } from "vue-router";

  export const globalMiddlewares: readonly RouteMiddleware[];
  export const namedMiddlewares: readonly RouteMiddleware[];
}

declare module "virtual:components" {
  import type { Plugin } from "vue";
  export const componentsPlugin: Plugin;
}

declare module "virtual:plugins" {
  import type { Plugin, App } from "vue";

  export const plugins: Record<string, (ctx: { app: App }) => void>;
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
