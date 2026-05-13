import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface PortProcessInfo {
  pid: number;
  processName: string;
  command: string;
}

/**
 * Retourne les informations du process utilisant un port
 */
export async function getProcessByPort(
  port: number,
): Promise<PortProcessInfo | null> {
  try {
    // Linux / macOS
    const { stdout } = await execAsync(`lsof -i :${port} -P -n`);

    const lines = stdout.trim().split('\n');

    // Ignore l'entête
    if (lines.length <= 1) {
      return null;
    }

    const processLine = lines[1];

    const columns = processLine.split(/\s+/);

    return {
      processName: columns[0],
      pid: Number(columns[1]),
      command: processLine,
    };
  } catch {
    return null;
  }
}
