import { exec } from 'child_process';

/**
 * WSL環境かどうかを判定
 * @returns WSL環境の場合はtrue
 */
export function isWSL(): boolean {
  try {
    const fsSync = require('fs');
    const osRelease = fsSync.readFileSync('/proc/version', 'utf8').toLowerCase();
    return osRelease.includes('microsoft') || osRelease.includes('wsl');
  } catch {
    return false;
  }
}

/**
 * WSL環境でURLを開く
 * @param url - 開くURL
 * @returns Promise
 */
export function openUrlInWSL(url: string): Promise<void> {
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
