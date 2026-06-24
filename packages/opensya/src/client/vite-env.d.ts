declare module "virtual:providers" {
  import type { ComponentType, ReactNode } from "react";
  export const providers: ComponentType<{ children: ReactNode }>[];
}

declare module "virtual:router" {
  import type { RouteObject } from "react-router-dom";
  export const routes: RouteObject[];
}

declare module "virtual:guards" {
  import type { ComponentType, ReactNode } from "react";

  export const guards: ComponentType<{ children: ReactNode }>[];
}

declare module "virtual:style";
