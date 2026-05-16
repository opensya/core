import { nestCompiler } from './compiler';
import { createApp } from './app';
import { nestEntry } from './entry';

export async function bootstrap() {
  nestEntry(async () => {
    await nestCompiler();
    await createApp();
  });
}

void bootstrap();
