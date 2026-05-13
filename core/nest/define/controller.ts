import {
  Controller as NestController,
  Req,
  RequestMethod,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import express from 'express';
import { Controller } from '../utils/controllers';
import { getProjectDirsv2, OpensyaConfigOutput } from '@opensya/config';
import { randomUUID } from 'node:crypto';

globalThis.defineController = function (handler, options = {}) {
  return {
    compiler: function (config: OpensyaConfigOutput, { file }) {
      const projectDirs = getProjectDirsv2(config);

      function buildOptions() {
        const methods = Object.values(RequestMethod).filter((v) =>
          _.isString(v),
        );
        const methodRegex = new RegExp(
          `(.)(${methods.join('|').toLowerCase()})(.)(js|ts)$`,
        );

        const idx = [];

        const url = file
          .replace(projectDirs.root.server.controllers.dir, '')
          .replace(methodRegex, '')
          .replace(/^\//, '')
          .replace(/\/$/, '')
          .replace(/.(js)$/, '')
          .replace(/(\/?)index$/, '');

        function getPaths(paths?: string | string[]) {
          if (!paths) return [url];

          paths = Array.isArray(paths) ? paths : [paths];

          paths = paths.map((path) =>
            path.startsWith('/') ? path : `${url}/${path}`,
          );

          return paths;
        }

        const path = getPaths(options.path);
        idx.push(...path);

        let method = options.method;
        if (!method)
          method = (file.match(methodRegex)?.at(2) as 'get') ?? 'get';
        idx.push(method);

        function getName() {
          let name = options?.name;
          if (name?.length) return name;

          if (!options?.path?.length) return randomUUID();

          if (typeof options.path === 'string') name = options.path;
          else name = options.path.join('-');

          return _.kebabCase(name.replaceAll('/', '-'));
        }
        const name = options.name ?? getName();

        const _options = {
          name,
          method,
          path,
          ...options,
          idx: idx.join('-'),
        };

        return _options;
      }

      const _options = buildOptions();

      @NestController()
      class ControllerClass {
        constructor(readonly i18n: I18nService) {}

        @Controller(_options)
        handler(@Req() req: express.Request) {
          return handler({
            req,
            res: req.res!,
            next: req.next!,
            i18n: this.i18n,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            $t: this.i18n.t,
          });
        }
      }

      _nestConfig.controllers[_options.idx] = ControllerClass;
    },
  };
};
