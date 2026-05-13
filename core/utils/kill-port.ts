import { getProcessByPort } from './get-process-by-port';
import { killProcess } from './kill-process';

export async function killPort(port: number) {
  const subprocess = await getProcessByPort(port);
  if (subprocess) killProcess(subprocess.pid);
}
