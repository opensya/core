import { nestEntry } from '@core/nest/entry';
import { prepareBuild } from './prepare';
import { execo } from '@core/utils/execo';
import { getDirs } from '@opensya/config';

void nestEntry(async () => {
  console.clear();

  const dirs = getDirs(_config);

  logger.start('Start building ...');

  console.log(dirs.output.join('tsconfig.server.build.json'));

  void prepareBuild();
  await execo(['tsc', '-p', dirs.output.join('tsconfig.server.build.json')], {
    wait: true,
    cwd: dirs.dir,
  });

  logger.success('Build completed');
});
