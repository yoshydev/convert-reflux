const { app, BrowserWindow, Menu } = require('electron');
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
      // DevTools の警告を抑制
      enableRemoteModule: false,
      contextIsolation: true
    }
  });

  // IPCハンドラーをHTMLロード前に登録
  registerIpcHandlers(mainWindow);

  mainWindow.loadFile('index.html');

  // 本番環境ではメニューを削除(DevToolsショートカットも無効化)
  if (process.env.NODE_ENV !== 'development') {
    Menu.setApplicationMenu(null);
  }

  // DevTools を開く際にコンソールの警告を抑制
  if (process.env.NODE_ENV === 'development') {
    // Autofill エラーを抑制するために、DevToolsを開く前にセッションを設定
    mainWindow.webContents.session.webRequest.onBeforeRequest({ urls: ['devtools://*'] }, (details, callback) => {
      callback({});
    });

    mainWindow.webContents.openDevTools({
      mode: 'detach',
      activate: false
    });
  }

  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 本番環境でDevToolsのショートカットを無効化
    if (process.env.NODE_ENV !== 'development') {
      if (
        (input.control || input.meta) && input.shift && input.key.toLowerCase() === 'i' ||
        input.key === 'F12'
      ) {
        event.preventDefault();
      }
    }
  });
}

// アプリ起動前にIPCハンドラーを先行登録
app.whenReady().then(() => {
  createWindow();
});

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
