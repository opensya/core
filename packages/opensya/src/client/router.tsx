import { createBrowserRouter } from "react-router-dom";
import { routes } from "virtual:router";
import { RootLayout } from "./root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: routes,
  },
]);
