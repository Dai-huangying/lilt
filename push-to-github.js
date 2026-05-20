const { spawn } = require('child_process');

console.log('========================================');
console.log('Pushing to GitHub');
console.log('Remote: https://github.com/Dai-huangying/lilt-mvp-is-available.git');
console.log('========================================\n');

const child = spawn('git', ['push', '-v', 'origin', 'main', '--force'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

child.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('[STDOUT]', output);
});

child.stderr.on('data', (data) => {
  const output = data.toString();
  console.log('[STDERR]', output);
  
  if (output.includes('login') || output.includes('authentication') || output.includes('credential')) {
    console.log('\n⚠️  需要 GitHub 登录授权');
    console.log('请在浏览器中登录 GitHub 或提供个人访问令牌');
  }
});

child.on('close', (code) => {
  console.log('\n========================================');
  if (code === 0) {
    console.log('✅ Push 成功!');
    console.log('项目已上传到 GitHub');
  } else {
    console.log('❌ Push 失败! Exit code:', code);
    console.log('\n可能需要登录 GitHub:');
    console.log('1. 访问 https://github.com/login');
    console.log('2. 登录你的账号');
    console.log('3. 生成个人访问令牌: https://github.com/settings/tokens');
    console.log('4. 再次尝试推送');
  }
  console.log('========================================');
});

child.on('error', (err) => {
  console.error('❌ 命令执行失败:', err.message);
});
