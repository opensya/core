export default defineVuePlugin(({ app }) => {
  // Access Vue instance cleanly
  app.config.globalProperties.$analytics = {
    track: (event: string) => console.log(`[Analytics] Tracked: ${event}`),
  };

  console.log("[Plugin] Analytics initialized successfully");
});
