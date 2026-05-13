import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
} from 'nestjs-i18n';
import { I18nLoader } from './loader';
import { defaultLocales } from './defaults';

export function getI18NModule() {
  return I18nModule.forRoot({
    fallbackLanguage: _config.i18n?.defaultLocale ?? defaultLocales[0],
    resolvers: [
      new CookieResolver(['lang', 'x-lang']),
      new HeaderResolver(['lang', 'x-lang']),
      AcceptLanguageResolver,
    ],

    loaders: [new I18nLoader()],
  });
}
