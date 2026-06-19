import { atomicWriteFile } from '@core/utils';
import { resolve } from 'node:path';

export const template = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quae at deleniti
    esse aspernatur fuga. Itaque ullam suscipit, sequi perspiciatis earum
  </StrictMode>,
);
`;

export function createMainJsx() {
  atomicWriteFile(resolve(_outputDir, 'main.jsx'), template);
}
