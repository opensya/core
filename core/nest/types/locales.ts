import { TOptions } from 'i18next';

type TranslateOptions = Omit<TOptions, 'ns'>;

declare global {
  // Exemple: useTranslate('auth.login.title')
  var useTranslate: (key: string, options?: TranslateOptions) => string;
  var $t: (key: string, options?: TranslateOptions) => string;
}

export {};
