import 'reflect-metadata';

import { describe, expect, it } from 'vitest';

import { initServices, registerService } from './register';

describe('services registry', () => {
  it('should register and resolve a service by name', async () => {
    const handler = async function () {
      return { name: "Orgs' name" };
    };

    registerService('config.get', handler);

    initServices();

    const service = useService('config.get');

    expect(service).toBe(handler);

    await expect(service()).resolves.toEqual({ name: "Orgs' name" });
  });

  it('should return undefined when service does not exist', () => {
    initServices();

    const service = useService('unknown.service');

    expect(service).toBeUndefined();
  });
});
