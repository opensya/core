import {
  ChildProcess,
  spawn,
  SpawnOptions,
  spawnSync,
  execSync,
} from 'node:child_process';

// const eventNames = [
//   'close',
//   'disconnect',
//   'error',
//   'exit',
//   'message',
//   'spawn',
// ] as const;

// type EventName = (typeof eventNames)[number];

type SpawnCommandInput = string | string[];

interface ParsedSpawnCommand {
  command: string;
  args: string[];
}

export function parseCommand(input: SpawnCommandInput): ParsedSpawnCommand {
  if (Array.isArray(input)) {
    const [command, ...args] = input;

    if (!command) {
      throw new Error('Command array cannot be empty');
    }

    return {
      command,
      args,
    };
  }

  const parts = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];

  if (parts.length === 0) {
    throw new Error('Command string cannot be empty');
  }

  const [command, ...args] = parts.map((part) =>
    part.replace(/^["']|["']$/g, ''),
  );

  return {
    command,
    args,
  };
}

function buildKill(subprocess: ExecoReturn) {
  function kill(signal?: NodeJS.Signals | number) {
    if (typeof subprocess.pid === 'number') {
      treeKillSync(subprocess.pid, signal);
    }
    subprocess.killed = true;
    return subprocess.killed;
  }

  function treeKillSync(pid: number, signal?: NodeJS.Signals | number) {
    if (process.platform === 'win32') {
      execSync('taskkill /pid ' + pid + ' /T /F');
      return;
    }
    const childs = getAllChilds(pid);
    childs.forEach(function (pid) {
      killPid(pid, signal);
    });
    killPid(pid, signal);
    return;
  }

  function getAllChilds(pid: number) {
    const allpid = getAllPid();

    const ppidHash: Record<string, number[]> = {};
    const result: number[] = [];

    allpid.forEach(function (item) {
      ppidHash[item.ppid] = ppidHash[item.ppid] || [];
      ppidHash[item.ppid].push(item.pid);
    });
    const find = function (pid: number) {
      ppidHash[pid] = ppidHash[pid] || [];
      ppidHash[pid].forEach(function (childPid) {
        result.push(childPid);
        find(childPid);
      });
    };
    find(pid);

    return result;
  }

  function getAllPid() {
    const result = spawnSync('ps', ['-A', '-o', 'pid,ppid'], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    if (result.error || !result.stdout) {
      return [];
    }
    const rows = result.stdout.trim().split('\n').slice(1);
    return rows
      .map(function (row) {
        const parts = row.match(/\s*(\d+)\s*(\d+)/);
        if (parts === null) {
          return null;
        }
        return {
          pid: Number(parts[1]),
          ppid: Number(parts[2]),
        };
      })
      .filter((input) => {
        return input != null;
      });
  }

  function killPid(pid: number, signal?: NodeJS.Signals | number) {
    try {
      process.kill(pid, signal);
    } catch (err) {
      if ((err as any).code !== 'ESRCH') {
        throw err;
      }
    }
  }

  subprocess.kill = kill;
  return subprocess;
}

export async function execo(
  input: SpawnCommandInput,
  options: SpawnOptions & {
    wait?: boolean;
    silent?: boolean;
  } = {},
): Promise<ExecoReturn> {
  const { command, args } = parseCommand(input);
  const { wait = false, silent = false } = options;

  const _options: SpawnOptions = {
    stdio: silent ? 'ignore' : 'inherit',
    shell: false,
    ...options,
  };

  const subprocess = spawn(command, args, _options) as ExecoReturn;
  buildKill(subprocess);

  if (wait) {
    return new Promise<ExecoReturn>((resolve, reject) => {
      subprocess.once('error', reject);
      subprocess.once('close', (exitCode) => {
        if (exitCode && exitCode > 0) {
          reject(new Error(`Exited with code ${exitCode}`));
          return;
        }
        resolve(subprocess);
      });
    });
  }

  return subprocess;
}

export type ExecoReturn = ChildProcess & { killed: boolean };
