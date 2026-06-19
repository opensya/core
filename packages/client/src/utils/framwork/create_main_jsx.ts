/* eslint-disable unicorn/no-incorrect-template-string-interpolation */

import { atomicWriteFile } from '@core/utils';
import { resolve } from 'node:path';
import { generateCode, parseModule } from 'magicast';

export const template = `import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { router } from './router';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
`;

export function createMainJsx() {
  const mod = parseModule(template);

  const { code } = generateCode(mod);

  atomicWriteFile(resolve(_outputDir, 'main.jsx'), code);
}
