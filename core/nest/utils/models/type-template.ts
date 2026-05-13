export const typeTemplate = `import model from "{import}";
type {name} = import('mongoose').HydratedDocumentFromSchema<typeof model['schema']>;

interface _Models {
 {name}: import('mongoose').Model<{name}>;
}

declare module 'mongoose' {
  interface Models extends _Models {}
}

declare global {
  function getModel(name: '{name}'): import('mongoose').Model<{name}>;
}

export {};
`;
