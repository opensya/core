export function generateNuxtConfig({
  modules = [],
  srcDir,
  cwd,
  buildDir,
}: {
  cwd: string;
  modules?: string[];
  srcDir: string;
  buildDir: string;
}) {
  const configContent = `export default defineNuxtConfig({
  srcDir: '${srcDir}',
  appDir: './',
  buildDir: './nuxt',

  nitro: {
    output: {
      dir: '${buildDir}',
    },
  },
  
  modules: [
${modules.map((m) => `    '${m}'`).join('\n,')},\n
    // --{module}--
  ],

  components: [{ path: '~/components/globals', global: true, prefix: 'o' }],

  opensya: {
    cwd: '${cwd}',
  },

  ssr: false,

  devtools: { enabled: true, },

  compatibilityDate: '2024-07-11',
});
`;

  return configContent;
}
