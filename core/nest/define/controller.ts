import { Controller as NestController, Next, Req, Res } from '@nestjs/common';
import express from 'express-serve-static-core';
import { Controller } from '../utils/controllers';
import { getDirs, OpensyaConfigOutput } from '@opensya/config';
import { randomUUID } from 'node:crypto';
import {
  buildControllerUrl,
  buildRoutePaths,
  getMehtodRegex,
} from '../utils/controllers/path';

globalThis.defineController = function (handler, options = {}) {
  return {
    compiler: function (config: OpensyaConfigOutput, { file }) {
      const projectDirs = getDirs(config);

      function buildOptions() {
        const idx = [];

        function getPaths(paths?: string | string[]) {
          return buildRoutePaths(
            buildControllerUrl(file, projectDirs.root.server.controllers.dir),
            paths,
          );
        }

        const path = getPaths(options.path);
        idx.push(...path);

        let method = options.method;
        if (!method)
          method = (file.match(getMehtodRegex())?.at(2) as 'get') ?? 'get';
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
        @Controller(_options)
        async handler(
          @Req() req: express.Request,
          @Res({ passthrough: true }) res: express.Response,
          @Next() next: express.NextFunction,
        ) {
          const result = await handler({ req, res, next });
          return result;
        }
      }

      _nestConfig.controllers[_options.idx] = ControllerClass;
    },
  };
};
