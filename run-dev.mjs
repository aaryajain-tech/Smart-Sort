import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const localPython = path.join(
  projectRoot,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
);
const python = existsSync(localPython) ? localPython : 'python';

const processes = [
  {
    name: 'backend',
    command: python,
    args: ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
  },
  {
    name: 'frontend',
    command: process.execPath,
    args: [path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'), '--port=3000', '--host=0.0.0.0'],
  },
];

const children = [];
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

for (const service of processes) {
  const child = spawn(service.command, service.args, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: false,
  });
  children.push(child);

  child.on('error', (error) => {
    console.error(`[${service.name}] Failed to start ${service.command}: ${error.message}`);
    shutdown(1);
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`[${service.name}] exited (${signal ?? `code ${code}`}); stopping the other service.`);
      shutdown(code ?? 1);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
