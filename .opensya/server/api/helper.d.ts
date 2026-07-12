declare global {
  const defineRouteHandler: (typeof import("../../../src/plugins/api/helper.ts"))["defineRouteHandler"];
  const appendPreHandler: (typeof import("../../../src/plugins/api/helper.ts"))["appendPreHandler"];
}

export {};
