import { prepareServer } from './prepare';
import { execo } from '#core/utils/execo';
import { getDirs } from '@opensya/config';
import { nestEntry } from '#core/nest//entry';
import { MayBePromise } from '@opensya/share';

export function runPrepare({ cb }: { cb?: () => MayBePromise<void> } = {}) {
  nestEntry(async () => {
    const dirs = getDirs(_config);

    // logger.start(`Prepare Opensya server ...`);

    prepareServer();

    const command = 'tsx';
    const args: string[] = [];

    args.push(dirs.output.server.mainjs.dir);
    await execo([command, ...args], {
      wait: true,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: { ...process.env, PREPARE_MODE: 'yes' },
    });

    void cb?.();
  });
}
