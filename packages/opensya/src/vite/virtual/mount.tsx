import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { getRouter } from './router';

export function mountApp() {
  const router = getRouter();
  const root = document.getElementById('root');

  if (!root) {
    throw new Error(
      `No mount element found from provided list of targets: ${root}`,
    );
  }

  createRoot(root).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
