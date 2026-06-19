import { createAppJsx } from './create_app_jsx';
import { createMainJsx } from './create_main_jsx';
import { createRouter } from './create_router';
import { createViteConfig } from './create_vite_config';

export function initFramework() {
  createViteConfig();
  createAppJsx();
  createRouter();
  createMainJsx();
}
