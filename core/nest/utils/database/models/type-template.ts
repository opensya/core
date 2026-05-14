export const typeTemplate = `import model from '{import}';

type {name}Model = import('{types-import}').InferModel<typeof model>;

interface _Models {
  {name}: {name}Model;
}

declare module 'mongoose' {
  interface Models extends _Models {}
}

declare global {
  function getModel(name: '{name}'): {name}Model;
}

export {};
`;
