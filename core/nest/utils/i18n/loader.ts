import { I18nLoader as _I18nLoader, I18nTranslation } from 'nestjs-i18n';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as rxjs from 'rxjs';

export class I18nLoader implements _I18nLoader {
  localeDirs: string[] = [];
  event: rxjs.Subject<any>;
  isDev: boolean;

  constructor() {
    this.isDev = ['factory', 'development'].includes(_env.CORE_ENV);
    this.event = new rxjs.Subject();
  }

  async languages() {
    if (this.isDev) {
      return rxjs.merge(
        rxjs.of(await this.getLanguages()),
        this.event.pipe(
          rxjs.switchMap(() => {
            return rxjs.from(this.getLanguages()).pipe(
              rxjs.catchError(() => {
                return rxjs.EMPTY;
              }),
            );
          }),
        ),
      );
    }

    return await this.getLanguages();
  }

  async getLanguages() {
    this.localeDirs = _nestConfig.i18nLocaleDirs
      .map((localeDir) =>
        readdirSync(localeDir).map((dir) => join(localeDir, dir)),
      )
      .flat()
      .filter((dir) => lstatSync(dir).isDirectory());

    return _.uniq(this.localeDirs.map((dir) => dir.split('/').at(-1)!));
  }
  async load() {
    if (this.isDev) {
      return rxjs.merge(
        rxjs.of(await this.getLoad()),
        this.event.pipe(
          rxjs.switchMap(() => {
            return rxjs.from(this.getLoad()).pipe(
              rxjs.catchError(() => {
                return rxjs.EMPTY;
              }),
            );
          }),
        ),
      );
    }

    return await this.getLoad();
  }

  async getLoad() {
    const langages: I18nTranslation = {};

    this.localeDirs.forEach((dir) => {
      _.merge(langages, this.loadContent(dir));
    });

    return langages;
  }

  loadContent(root: string): I18nTranslation {
    const language: I18nTranslation = {};
    const name = root
      .replace(/.json$/, '')
      .split('/')
      .at(-1)!;

    if (!existsSync(root)) return language;

    const stats = lstatSync(root);
    if (stats.isDirectory()) {
      const dirs = readdirSync(root);
      for (const dir of dirs) {
        const absRoot = join(root, dir);
        if (!existsSync(absRoot)) continue;
        _.merge(language, this.loadContent(absRoot));
      }
    } else if (root.endsWith('.json')) {
      const content: I18nTranslation = JSON.parse(
        readFileSync(root, 'utf-8') || '{}',
      );
      _.merge(language, content);
    }

    return { [name]: language };
  }
}
