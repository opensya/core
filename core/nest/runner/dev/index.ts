import { nestEntry } from '../../entry';
import { devPrepare } from './run-prepare';
import { execo, ExecoReturn } from '@core/utils/execo';
import { getDirs } from '@opensya/config';
import { Stats } from 'fs-extra';
import chokidar from 'chokidar';
import { resolve } from 'node:path';

void nestEntry(async () => {
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
      if (!dirs.output.server.mainjs.exists()) return;

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

      args.push(dirs.output.server.mainjs.dir);
      serverProcess = await execo([command, ...args]);
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
