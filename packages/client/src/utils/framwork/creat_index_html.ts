import { atomicWriteFile } from '@core/utils';
import { resolve } from 'node:path';

export const template = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.jsx"></script>
  </body>
</html>
`;

export function createIndexHtml() {
  atomicWriteFile(resolve(_outputDir, 'index.html'), template);
}
