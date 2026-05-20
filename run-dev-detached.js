const { spawn } = require('child_process');
const path = require('path');

process.env.PATH = 'F:\\;' + process.env.PATH;
process.env.NODE_ENV = 'development';

const nextPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'cli', 'next-dev.js');

console.log('Starting Next.js dev server...');
console.log('Path:', nextPath);

const child = spawn('F:\\node.exe', [nextPath, '--port', '3000', '--verbose'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env,
  detached: true,
  shell: true
});

child.unref();

console.log('Server started in background. PID:', child.pid);
console.log('Open http://localhost:3000 in your browser');
