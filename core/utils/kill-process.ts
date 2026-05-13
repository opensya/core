import { execSync, spawnSync } from 'node:child_process';

export function killProcess(pid: number, signal?: NodeJS.Signals | number) {
  treeKillSync(pid, signal);
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
