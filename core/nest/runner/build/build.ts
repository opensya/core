import { prepareBuild } from './prepare';
import { execo } from '@core/utils/execo';
import { getDirs } from '@opensya/config';

export async function build() {
  console.clear();

  const dirs = getDirs(_config);

  logger.start('Start building ...');

  console.log(dirs.output.join('tsconfig.server.build.json'));

  void prepareBuild();
  await execo(
    ['tsc', '-p', dirs.output.join('tsconfig.server.build.json').dir],
    {
      wait: true,
      cwd: dirs.dir,
    },
  );

  logger.success('Build completed');
}
