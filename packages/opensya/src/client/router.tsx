import { createBrowserRouter } from "react-router";
import { routes } from "virtual:router";
import { RootLayout } from "./root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: routes,
  },
]);
