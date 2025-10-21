const { spawn } = require('child_process');
const os = require('os');

// Windows PowerShell/cmdでの実行時のみchcpを実行
if (os.platform() === 'win32') {
  const chcp = spawn('chcp', ['65001'], { shell: true, stdio: 'ignore' });
  chcp.on('close', () => {
    runBuildAndElectron();
  });
} else {
  runBuildAndElectron();
}

function runBuildAndElectron() {
  // build-config.jsを実行
  const buildConfig = spawn('node', ['build-config.js'], {
    shell: true,
    stdio: 'inherit',
    env: { ...process.env }
  });

  buildConfig.on('close', (code) => {
    if (code !== 0) {
      process.exit(code);
    }

    // Electronを起動
    const electron = spawn('npx', ['cross-env', 'NODE_ENV=development', 'electron', '.', '--enable-logging'], {
      shell: true,
      stdio: 'inherit',
      env: { ...process.env }
    });

    electron.on('close', (code) => {
      process.exit(code);
    });
  });
}
