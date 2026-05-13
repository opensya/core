export const typeTemplate = `
import service from "{import}";

type Handler = (typeof service)['default']['handler'];
type R = ReturnType<Handler>;
type P = Parameters<Handler>;

declare global {
  function useService(name: '{name}'): Handler;
}

export {};
`;
