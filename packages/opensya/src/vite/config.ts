import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { viteOpensyaReactPlugin } from './plugin';

export function createOpensyaViteConfig({
  coreDir,
  outputDir,
  root,
}: {
  coreDir: string;
  outputDir: string;
  root: string;
}) {
  return defineConfig({
    root,
    plugins: [viteReact(), viteOpensyaReactPlugin({ coreDir, outputDir })],
    ssr: {
      external: ['use-sync-external-store'],
    },
  });
}
