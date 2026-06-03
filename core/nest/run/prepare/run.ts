import { prepareServer } from './prepare';
import { execo } from '#core/utils/execo';
import { nestEntry } from '#core/nest//entry';
import { MayBePromise } from '@opensya/share';

export async function runPrepare({
  cb,
}: { cb?: () => MayBePromise<void> } = {}) {
  const { dirs } = await nestEntry();

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
}
