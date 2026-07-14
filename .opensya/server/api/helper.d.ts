declare global {
  const defineRouteHandler: (typeof import("../../../src/plugins/api/helper/index.js"))["defineRouteHandler"];
  const appendPreHandler: (typeof import("../../../src/plugins/api/helper/index.js"))["appendPreHandler"];
  const defineRouteMiddleware: (typeof import("../../../src/plugins/api/helper/index.js"))["defineRouteMiddleware"];
}

export {};
