import { loadServices } from "./load";
import { services } from "./services";

export interface GetService {
  <R = unknown, P extends unknown[] = []>(
    name: string,
  ): (...args: P) => Promise<R>;
}

export async function registerServices() {
  const _services = await loadServices();

  for (const service of _services) {
    if (!service.content.default) continue;

    Object.assign(services, {
      [service._meta.name]: service.content.default.service,
    });
  }
}
