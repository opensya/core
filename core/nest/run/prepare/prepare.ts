import { getDirs } from '@opensya/config';
import { writeServerTsconfig } from '../../utils';
import { writeMainJs } from '#core/nest/utils/write-mainjs';

export function prepareServer() {
  const dirs = getDirs(_config);

  function ensureOutput() {
    dirs.output.server.ensureExists();
    dirs.output.server.types.ensureExists();
  }

  void ensureOutput();
  void writeMainJs(dirs.output.server.mainjs.dir);
  void writeServerTsconfig(_config);
}
