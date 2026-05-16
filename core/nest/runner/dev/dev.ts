import { devPrepare } from './prepare';
import { execo, ExecoReturn } from '@core/utils/execo';
import { Stats } from 'fs-extra';
import { resolve } from 'node:path';
import { getDirs } from '@opensya/config';
import chokidar from 'chokidar';
import { nestEntry } from '@core/nest/entry';

export async function dev() {
  nestEntry(() => {
    const dirs = getDirs(_config);
    let serverProcess: ExecoReturn | null = null;

    function listen() {
      async function onChange(file: string, stats?: Stats) {
        if (!stats?.isFile()) return;
        if (!file.endsWith('.ts') && !file.endsWith('.js')) return;

        void run('Restarting');
      }

      const listenDirs: string[] = [dirs.root.server.dir];

      if (_env.CORE_ENV === 'factory') {
        listenDirs.push(resolve(__dirname, '../..'));
      }

      chokidar
        .watch(listenDirs, { ignoreInitial: true })
        .on('add', (...args) => void onChange(...args))
        .on('unlink', (...args) => void onChange(...args))
        .on('change', (...args) => void onChange(...args));
    }

    const run = _.debounce(async (action: string = 'Starting') => {
      try {
        if (action !== 'Starting') await stop();

        console.clear();

        logger.start(`${action} Opensya server ...`);

        devPrepare();

        const command = 'tsx';
        const args: string[] = [];

        if (_env.CORE_ENV === 'factory') {
          args.push(
            `--tsconfig`,
            resolve(__dirname, '../../../../tsconfig.dev.json'),
          );
        }

        // const bootstrapDir = useDir({
        //   dir:
        //     _env.CORE_ENV === 'factory'
        //       ? resolve(__dirname, '../../bootstrap.ts')
        //       : resolve(__dirname, '../../bootstrap.js'),
        // });
        // args.push(bootstrapDir.dir);

        args.push(dirs.output.server.mainjs.dir);
        serverProcess = await execo([command, ...args], {});
      } catch (error) {
        logger.error(error);
      }
    }, 500);

    async function stop() {
      if (!serverProcess) return true;
      if (serverProcess.killed) return true;

      logger.start('Stopping server ...');

      serverProcess.kill('SIGTERM');
      serverProcess = null;

      logger.success('Server stopped');
      return true;
    }

    void listen();
    void run();
  });
}
