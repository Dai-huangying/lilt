const { spawn } = require('child_process');
const { execSync } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('   LILT Development Server');
console.log('   LAN Access Enabled');
console.log('========================================\n');

function getLocalIP() {
  try {
    const interfaces = require('os').networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (e) {}
  return '192.168.1.203';
}

const localIP = getLocalIP();
const port = '3010';

console.log('📡 Local IP:', localIP);
console.log('🔌 Port:', port);
console.log('');
console.log('🌐 Mobile Access:');
console.log(`   http://${localIP}:${port}/sing`);
console.log('');
console.log('💻 Local Access:');
console.log(`   http://localhost:${port}/sing`);
console.log(`   http://127.0.0.1:${port}/sing`);
console.log('');
console.log('⏳ Starting server...\n');

const nextPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn('F:\\node.exe', ['node_modules\\next\\dist\\bin\\next', 'dev', '-H', '0.0.0.0', '-p', '3010'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe'],
  detached: false,
  shell: false
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write('[NEXT.JS] ' + output);

  if (output.includes('Ready') || output.includes('started server') || output.includes('localhost')) {
    console.log('\n========================================');
    console.log('✅ Server Ready!');
    console.log('========================================\n');
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write('[NEXT.JS ERROR] ' + data.toString());
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
});

child.on('exit', (code, signal) => {
  console.log('\nServer exited with code:', code);
});
