const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./src/handlers/ipc-handlers');
const auth = require('./src/services/auth');

let mainWindow;


function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      defaultEncoding: 'utf-8'
    }
  });

  mainWindow.loadFile('index.html');

  // 開発中は常にDevToolsを開く
  mainWindow.webContents.openDevTools();

  // IPCハンドラーを登録
  registerIpcHandlers(mainWindow);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // OAuth2クライアントをクリア
  auth.clearOAuth2Client();
});
