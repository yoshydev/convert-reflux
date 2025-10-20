const { exec } = require('child_process');

/**
 * WSL環境かどうかを判定
 * @returns {boolean}
 */
function isWSL() {
  try {
    const fs = require('fs');
    const osRelease = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return osRelease.includes('microsoft') || osRelease.includes('wsl');
  } catch {
    return false;
  }
}

/**
 * WSL環境でURLを開く
 * @param {string} url
 * @returns {Promise<void>}
 */
function openUrlInWSL(url) {
  return new Promise((resolve, reject) => {
    exec(`powershell.exe -Command "Start-Process '${url}'"`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  isWSL,
  openUrlInWSL
};
