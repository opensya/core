import App from './app';
import { createBrowserRouter } from 'react-router-dom';

import { routes } from '$output:client/routes';

export function getRouter() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: routes,
    },
  ]);

  return router;
}
