import { spawn } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';

const DEV_URL = 'http://127.0.0.1:3000';
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for Vite server at ${url}`));
        } else {
          setTimeout(check, 250);
        }
      });
    };
    check();
  });
}

const viteProc = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'inherit',
  shell: false,
});

let electronProc = null;

function cleanup() {
  if (electronProc && !electronProc.killed) {
    electronProc.kill();
  }
  if (viteProc && !viteProc.killed) {
    viteProc.kill();
  }
}

process.on('SIGINT', () => {
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

try {
  await waitForServer(DEV_URL);
  electronProc = spawn(npxCmd, ['electron', '.'], {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: DEV_URL,
    },
  });

  electronProc.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });
} catch (err) {
  console.error(err);
  cleanup();
  process.exit(1);
}
