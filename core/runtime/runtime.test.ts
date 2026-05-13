import { describe, expect, it } from 'vitest';

describe('Opensya Runtime', () => {
  it('should expose global runtime variables', () => {
    expect(_config).toBeDefined();
    expect(_env).toBeDefined();
    expect(_nestConfig).toBeDefined();
  });

  it('should have a valid runtime config object', () => {
    expect(typeof _config).toBe('object');
    expect(typeof _env).toBe('object');
    expect(typeof _nestConfig).toBe('object');
  });
});
