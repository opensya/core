import { atomicWriteFile } from '@core/utils';
import { resolve } from 'node:path';

export function createAppJsx() {
  const template = `import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
`;

  atomicWriteFile(resolve(_outputDir, 'App.jsx'), template);
}
