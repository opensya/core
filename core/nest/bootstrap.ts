import { nestCompiler } from './compiler';
import { createApp } from './app';

export async function bootstrap() {
  await nestCompiler();
  await createApp();
}
