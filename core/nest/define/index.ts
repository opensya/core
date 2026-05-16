export async function define() {
  await import('./service.js');
  await import('./controller.js');
  await import('./guard.js');
  await import('./mongoose-plugin.js');
}
