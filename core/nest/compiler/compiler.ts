import * as database from './database';
import * as services from './services';
import * as controllers from './controllers';
import * as locales from './locales';
import { setNestConfig } from '../utils/nest';

export async function nestCompiler() {
  setNestConfig(_config);

  await database.compiler(_config);
  await services.compiler(_config);
  await controllers.compiler(_config);
  await locales.compiler(_config);
}
