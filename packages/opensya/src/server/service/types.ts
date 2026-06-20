declare global {
  // function useService<R = unknown, P extends unknown[] = []>(
  //   name: string,
  // ): (...args: P) => Promise<R>;

  function useService<R = unknown>(
    name: string,
  ): (...arguments_: unknown[]) => Promise<R>;

  function useService(
    name: string,
  ): (...arguments_: unknown[]) => Promise<unknown>;
}

export {};
