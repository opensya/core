import '../../utils/set-globals';
import { config as dotenv } from 'dotenv';
import { loadConfig } from '@opensya/config';
import { prepareBuild } from './prepare';

void loadConfig().then(async (config) => {
  console.clear();

  dotenv({ path: config.server.envFile ?? '.env' });
  prepareBuild(config);
});
