import { atomicWriteFile } from '@core/utils';
import { resolve } from 'node:path';

export const template = `<script setup lang="ts"></script>

<template>
  <NuxtPage />
</template>
`;

export function createAppVue() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  atomicWriteFile(resolve(_outputDir, 'app.vue'), template);
}
