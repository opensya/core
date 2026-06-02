import { nestCompiler } from './compiler';
import { createApp } from './app';
import { nestEntry } from './entry';

export function bootstrap() {
  nestEntry(async () => {
    await nestCompiler();
    await createApp();
  });
}
