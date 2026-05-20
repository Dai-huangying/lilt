const { spawn } = require('child_process');
const path = require('path');

process.env.PATH = 'F:\\;' + process.env.PATH;
process.env.NODE_ENV = 'development';

console.log('PATH:', process.env.PATH);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Working directory:', process.cwd());

const nextPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'cli', 'next-dev.js');
console.log('Next.js path:', nextPath);

const fs = require('fs');
if (fs.existsSync(nextPath)) {
  console.log('Next.js file exists');
} else {
  console.log('ERROR: Next.js file does not exist:', nextPath);
  process.exit(1);
}

const child = spawn('F:\\node.exe', [nextPath, '--port', '3000'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env,
  shell: false
});

child.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

child.on('error', (err) => {
  console.error('SPAWN ERROR:', err);
});

child.on('exit', (code, signal) => {
  console.log('Child process exited with code:', code, 'signal:', signal);
});

console.log('Child process spawned');
