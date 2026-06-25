import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { providers } from "virtual:providers";

import "virtual:style";

function composeProviders(
  children: React.ReactNode,
  providers: React.ComponentType<{ children: React.ReactNode }>[],
) {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, children);
}

export const Provider = composeProviders(
  <RouterProvider router={router} />,
  providers,
);

createRoot(document.getElementById("root")!).render(Provider);
