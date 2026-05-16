import i18next, { i18n } from 'i18next';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { defaultLocales } from './defaults';

type LocaleObject = Record<string, unknown>;

export async function createI18n() {
  const instance = i18next.createInstance();

  await instance.init({
    fallbackLng: _config.i18n?.defaultLocale ?? defaultLocales[0],
    defaultNS: 'common',
    ns: [],
    interpolation: {
      escapeValue: false,
    },
  });

  loadLocaleDirs(instance, _nestConfig.i18nLocaleDirs);

  globalThis.useTranslate = function (value, options): string {
    const [namespace, ...keyParts] = value.split('.');

    if (!namespace || keyParts.length === 0) {
      return instance.t(value, options);
    }

    return instance.t(keyParts.join('.'), {
      ...options,
      ns: namespace,
    });
  };
}

function loadLocaleDirs(instance: i18n, localeDirs: string[]) {
  for (const localeDir of localeDirs) {
    loadLocaleDir(instance, localeDir);
  }
}

function loadLocaleDir(instance: i18n, localeDir: string) {
  if (!existsSync(localeDir)) return;

  const languages = readdirSync(localeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const lang of languages) {
    const langDir = join(localeDir, lang);

    const files = readdirSync(langDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .filter((entry) => entry.name.endsWith('.json'));

    for (const file of files) {
      const namespace = basename(file.name, extname(file.name));
      const filePath = join(langDir, file.name);
      const content = readJsonFile(filePath);

      instance.addResourceBundle(lang, namespace, content, true, true);
    }
  }
}

function readJsonFile(filePath: string): LocaleObject {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as LocaleObject;
}
