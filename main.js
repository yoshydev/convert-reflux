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
      nodeIntegration: false,
      defaultEncoding: 'utf-8',
      devTools: true,
      // DevTools の警告を抑制
      enableRemoteModule: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');

  // DevTools を開く際にコンソールの警告を抑制
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({
      mode: 'detach',
      activate: false
    });

    // Autofill エラーを無視
    mainWindow.webContents.on('console-message', (event, level, message) => {
      if (message.includes('Autofill')) {
        event.preventDefault();
      }
    });
  }

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
