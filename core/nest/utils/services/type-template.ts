export const typeTemplate = `type Handler = (typeof import("{import}"))['default']['handler'];
type R = ReturnType<Handler>;
type P = Parameters<Handler>;

declare global {
  function useService(name: '{name}'): Handler;
}

export {};
`;
