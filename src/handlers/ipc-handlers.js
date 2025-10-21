const { ipcMain, dialog } = require('electron');
const config = require('../utils/config');
const { convertTsvToCsv } = require('../utils/converter');
const auth = require('../services/auth');
const drive = require('../services/drive');

/**
 * すべてのIPCハンドラーを登録
 */
function registerIpcHandlers(mainWindow) {
  // ビルド時の設定情報を取得
  ipcMain.handle('get-build-config', async () => {
    return config.getBuildConfig();
  });

  // ファイル選択ダイアログ
  ipcMain.handle('select-tsv-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'TSV Files', extensions: ['tsv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled) {
      return null;
    }
    return result.filePaths[0];
  });

  // TSVをCSVに変換
  ipcMain.handle('convert-tsv-to-csv', async (event, tsvPath, outputFileName) => {
    try {
      return await convertTsvToCsv(tsvPath, outputFileName);
    } catch (error) {
      console.error('Convert error:', error);
      return { success: false, error: error.message };
    }
  });

  // 認証情報をクリア
  ipcMain.handle('clear-credentials', async () => {
    try {
      config.clearCredentials();
      return { success: true };
    } catch (error) {
      console.error('Clear credentials error:', error);
      return { success: false, error: error.message };
    }
  });

  // Google Drive認証の初期化
  ipcMain.handle('init-google-auth', async (event, credentials) => {
    try {
      const result = await auth.initGoogleAuth(credentials, mainWindow);
      return result;
    } catch (error) {
      console.error('Auth init error:', error);
      return { success: false, error: error.message };
    }
  });

  // トークンを設定
  ipcMain.handle('set-tokens', async (event, tokens) => {
    try {
      auth.restoreOAuth2Client(tokens);
      return { success: true };
    } catch (error) {
      console.error('Set tokens error:', error);
      return { success: false, error: error.message };
    }
  });

  // Google Driveにアップロード
  ipcMain.handle('upload-to-drive', async (event, { filePath, fileName }) => {
    try {
      const oauth2Client = auth.getOAuth2Client();
      const result = await drive.uploadToDrive(oauth2Client, filePath, fileName);
      return { success: true, ...result };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }
  });
}

module.exports = {
  registerIpcHandlers
};
