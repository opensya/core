// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Services = {};

export type ServiceName = keyof Services;

export type Service<TKey extends ServiceName> = Services[TKey];

export const services = {} as Services;

export function getService<TKey extends ServiceName>(
  name: TKey,
): Service<TKey> {
  const service = services[name];

  if (!service) throw new Error(`Service "${name}" not found`);

  return service;
}
