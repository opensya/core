import { nestEntry } from '@core/nest/entry';
import { prepareBuild } from './prepare';
import { execo } from '@core/utils/execo';

void nestEntry(async (config, { dirs }) => {
  console.clear();

  logger.start('Start building ...');

  console.log(dirs.output.join('tsconfig.server.build.json'));

  void prepareBuild();
  await execo(['tsc', '-p', dirs.output.join('tsconfig.server.build.json')], {
    wait: true,
    cwd: dirs.dir,
  });

  logger.success('Build completed');
});
