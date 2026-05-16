type MaybePromise<T> = T | Promise<T>;

type Step<Args extends unknown[], NextArgs extends unknown[]> = (
  ...args: Args
) => MaybePromise<NextArgs>;

export async function runPipeline<Args extends unknown[]>(
  initialArgs: Args,
  steps: Step<any, any>[],
): Promise<unknown[]> {
  let currentArgs: unknown[] = initialArgs;

  for (const step of steps) {
    currentArgs = await Promise.resolve(step(...currentArgs));
  }

  return currentArgs;
}
