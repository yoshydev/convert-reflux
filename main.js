const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { google } = require('googleapis');
const Store = require('electron-store');
const http = require('http');

// ビルド時に埋め込まれた設定を読み込み
let config;
try {
  config = require('./config.js');
  console.log('✅ ビルド時の設定を読み込みました');
} catch (error) {
  console.warn('⚠️  config.js が見つかりません。npm start を実行してください。');
  config = {
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: ''
  };
}

const CLIENT_ID = config.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET;

// アプリ専用のフォルダ名
const APP_FOLDER_NAME = 'TSV to CSV Uploads';

// 暗号化されたストアの初期化
const store = new Store({
  encryptionKey: 'tsv-csv-converter-secure-key-2024',
  name: 'config'
});

let mainWindow;
let oauth2Client = null;

// WSL環境かどうかを判定
function isWSL() {
  try {
    const fs = require('fs');
    const osRelease = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    return osRelease.includes('microsoft') || osRelease.includes('wsl');
  } catch {
    return false;
  }
}

// WSL環境でURLを開く
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

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      defaultEncoding: 'utf-8' // 追加
    }
  });

  mainWindow.loadFile('index.html');

  // 開発中は常にDevToolsを開く
  mainWindow.webContents.openDevTools();
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

app.on('before-quit', (event) => {
  // 開いているサーバーがあれば閉じる
  if (oauth2Client) {
    oauth2Client = null;
  }
});


// ビルド時の設定情報を取得
ipcMain.handle('get-build-config', async () => {
  return {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET
  };
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
    const tsvContent = await fs.readFile(tsvPath, 'utf-8');

    const lines = tsvContent.split('\n');
    const csvLines = lines.map(line => {
      const fields = line.split('\t').map(field => {
        if (field.includes(',') || field.includes('\n') || field.includes('"')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      return fields.join(',');
    });
    const csvContent = csvLines.join('\n');

    const dir = path.dirname(tsvPath);
    const finalOutputName = outputFileName || path.basename(tsvPath).replace(/\.tsv$/i, '.csv');
    const csvPath = path.join(dir, finalOutputName);

    await fs.writeFile(csvPath, csvContent, 'utf-8');

    return { success: true, csvPath, fileName: finalOutputName };
  } catch (error) {
    console.error('Convert error:', error);
    return { success: false, error: error.message };
  }
});

// 認証情報を保存
ipcMain.handle('save-credentials', async (event, { clientId, clientSecret }) => {
  try {
    if (!CLIENT_ID && clientId) store.set('google.clientId', clientId);
    if (!CLIENT_SECRET && clientSecret) store.set('google.clientSecret', clientSecret);
    return { success: true };
  } catch (error) {
    console.error('Save credentials error:', error);
    return { success: false, error: error.message };
  }
});

// 認証情報を取得
ipcMain.handle('get-credentials', async () => {
  try {
    return {
      clientId: CLIENT_ID || store.get('google.clientId') || '',
      clientSecret: CLIENT_SECRET || store.get('google.clientSecret') || ''
    };
  } catch (error) {
    console.error('Get credentials error:', error);
    return { clientId: '', clientSecret: '' };
  }
});

// 認証情報をクリア
ipcMain.handle('clear-credentials', async () => {
  try {
    store.delete('google.clientId');
    store.delete('google.clientSecret');
    store.delete('google.folderId');
    store.delete('google.tokens');
    return { success: true };
  } catch (error) {
    console.error('Clear credentials error:', error);
    return { success: false, error: error.message };
  }
});

// フォルダIDをリセット
ipcMain.handle('reset-folder', async () => {
  try {
    store.delete('google.folderId');
    return { success: true };
  } catch (error) {
    console.error('Reset folder error:', error);
    return { success: false, error: error.message };
  }
});

// Google Drive認証の初期化（自動ブラウザ起動 & コールバック処理）
ipcMain.handle('init-google-auth', async (event, credentials) => {
  let server = null;

  try {
    const clientId = CLIENT_ID || credentials.clientId;
    const clientSecret = CLIENT_SECRET || credentials.clientSecret;
    const redirectUri = 'http://localhost:3000/oauth2callback';

    if (!clientId || !clientSecret) {
      throw new Error('Client IDとClient Secretが設定されていません');
    }

    if (!CLIENT_ID) {
      await store.set('google.clientId', credentials.clientId);
    }
    if (!CLIENT_SECRET) {
      await store.set('google.clientSecret', credentials.clientSecret);
    }

    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file']
    });

    // ローカルサーバーを起動してOAuthコールバックを受け取る
    return new Promise((resolve, reject) => {
      server = http.createServer(async (req, res) => {
        try {
          const url = new URL(req.url, `http://localhost:3000`);

          if (url.pathname === '/oauth2callback') {
            const code = url.searchParams.get('code');
            const error = url.searchParams.get('error');

            if (error) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body><h1>認証がキャンセルされました</h1><p>このウィンドウを閉じてください。</p></body></html>');
              server.close();
              reject(new Error(`認証エラー: ${error}`));
              return;
            }

            if (code) {
              try {
                // 認証コードからトークンを取得
                const { tokens } = await oauth2Client.getToken(code);
                oauth2Client.setCredentials(tokens);
                store.set('google.tokens', tokens);

                // 成功メッセージを表示
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<html><body><h1>✅ 認証に成功しました！</h1><p>このウィンドウを閉じてアプリに戻ってください。</p></body></html>');

                server.close();

                // レンダラープロセスに認証成功を通知
                mainWindow.webContents.send('auth-success', { tokens });

                resolve({ success: true, message: '認証が完了しました' });
              } catch (tokenError) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<html><body><h1>❌ トークン取得エラー</h1><p>このウィンドウを閉じてください。</p></body></html>');
                server.close();
                reject(tokenError);
              }
            } else {
              res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body><h1>認証コードが見つかりません</h1></body></html>');
              server.close();
              reject(new Error('認証コードが見つかりません'));
            }
          }
        } catch (err) {
          console.error('Server error:', err);
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<html><body><h1>サーバーエラー</h1></body></html>');
          server.close();
          reject(err);
        }
      });

      server.on('error', (err) => {
        console.error('Server error:', err);
        if (server) server.close();
        reject(new Error(`サーバーエラー: ${err.message}`));
      });

      server.listen(3000, async () => {
        console.log('OAuth callback server listening on port 3000');
        // ブラウザを自動で開く
        try {
          if (isWSL()) {
            await openUrlInWSL(authUrl);
          } else {
            await shell.openExternal(authUrl);
          }
        } catch (error) {
          console.error('ブラウザ起動エラー:', error);
          reject(new Error('ブラウザを起動できませんでした'));
        }
      });

      // タイムアウト処理（5分）
      setTimeout(() => {
        if (server.listening) {
          server.close();
          reject(new Error('認証がタイムアウトしました（5分）'));
        }
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    if (server && server.listening) {
      server.close();
    }
    console.error('Auth init error:', error);
    return { success: false, error: error.message };
  }
});

// 認証コードからトークンを取得
ipcMain.handle('exchange-auth-code', async (event, code) => {
  try {
    if (!oauth2Client) {
      throw new Error('OAuth2クライアントが初期化されていません');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    store.set('google.tokens', tokens);

    return { success: true, tokens };
  } catch (error) {
    console.error('Token exchange error:', error);
    return { success: false, error: error.message };
  }
});

// トークンを設定
ipcMain.handle('set-tokens', async (event, tokens) => {
  try {
    const clientId = CLIENT_ID || store.get('google.clientId');
    const clientSecret = CLIENT_SECRET || store.get('google.clientSecret');
    const savedTokens = tokens || store.get('google.tokens');

    if (!clientId || !clientSecret) {
      throw new Error('認証情報が保存されていません');
    }

    if (!savedTokens) {
      throw new Error('トークンが保存されていません');
    }

    oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3000/oauth2callback'
    );

    oauth2Client.setCredentials(savedTokens);
    return { success: true };
  } catch (error) {
    console.error('Set tokens error:', error);
    return { success: false, error: error.message };
  }
});

// アプリ専用フォルダを取得または作成
async function getOrCreateAppFolder(drive) {
  try {
    let folderId = store.get('google.folderId');

    if (folderId) {
      try {
        await drive.files.get({ fileId: folderId });
        console.log('既存のフォルダを使用:', folderId);
        return folderId;
      } catch (error) {
        console.log('保存されていたフォルダが見つかりません。新しく作成します。');
        folderId = null;
      }
    }

    const searchResponse = await drive.files.list({
      q: `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      folderId = searchResponse.data.files[0].id;
      console.log('既存のフォルダを発見:', folderId);
    } else {
      const folderMetadata = {
        name: APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name'
      });

      folderId = folder.data.id;
      console.log('新しいフォルダを作成:', folderId);
    }

    store.set('google.folderId', folderId);
    return folderId;

  } catch (error) {
    console.error('フォルダの取得/作成エラー:', error);
    throw error;
  }
}

// Google Driveにアップロード
ipcMain.handle('upload-to-drive', async (event, { filePath, fileName }) => {
  try {
    if (!oauth2Client) {
      throw new Error('Google Drive認証が完了していません');
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const folderId = await getOrCreateAppFolder(drive);

    const uploadFileName = fileName || path.basename(filePath);
    const fileContent = await fs.readFile(filePath);

    const searchQuery = `name='${uploadFileName}' and '${folderId}' in parents and trashed=false`;

    const response = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    let fileId;
    let action;

    if (response.data.files && response.data.files.length > 0) {
      fileId = response.data.files[0].id;
      await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'text/csv',
          body: fileContent
        }
      });
      action = 'updated';
    } else {
      const fileMetadata = {
        name: uploadFileName,
        parents: [folderId]
      };

      const media = {
        mimeType: 'text/csv',
        body: fileContent
      };

      const file = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink'
      });

      fileId = file.data.id;
      action = 'created';
    }

    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, webViewLink'
    });

    const folderInfo = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, webViewLink'
    });

    return {
      success: true,
      fileId,
      action,
      fileInfo: fileInfo.data,
      folderInfo: folderInfo.data
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
});

// 保存ダイアログ
ipcMain.handle('save-dialog', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return null;
  }
  return result.filePath;
});
