import type ts from 'typescript';

export type TSCompilerPluginContext = {
  ts: typeof ts;
};

export type TSCompilerPlugin = {
  name: string;

  /**
   * Ajouter des fichiers .ts / .d.ts au programme TypeScript
   */
  types?: string[];

  /**
   * Fichiers à placer en priorité dans rootNames
   */
  priority?: string[];

  /**
   * Modifier un fichier au moment de l'écriture
   */
  transformFile?: (
    fileName: string,
    content: string,
    context: TSCompilerPluginContext,
  ) => string | Promise<string>;
};
