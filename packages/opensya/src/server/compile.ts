import { compileControllers } from './controller';
import { compileServices } from './service';

export function compile() {
  compileControllers();
  compileServices();
}
