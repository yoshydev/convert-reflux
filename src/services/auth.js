const { google } = require('googleapis');
const { shell } = require('electron');
const http = require('http');
const config = require('../utils/config');
const { isWSL, openUrlInWSL } = require('../utils/wsl');

let oauth2Client = null;

/**
 * OAuth2クライアントを取得
 */
function getOAuth2Client() {
  return oauth2Client;
}

/**
 * OAuth2クライアントを初期化
 */
function createOAuth2Client(clientId, clientSecret, redirectUri = 'http://localhost:3000/oauth2callback') {
  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  return oauth2Client;
}

/**
 * 保存されたトークンでOAuth2クライアントを復元
 */
function restoreOAuth2Client(tokens) {
  const clientId = config.getClientId();
  const clientSecret = config.getClientSecret();
  const savedTokens = tokens || config.getTokens();

  if (!clientId || !clientSecret) {
    throw new Error('認証情報が保存されていません');
  }

  if (!savedTokens) {
    throw new Error('トークンが保存されていません');
  }

  oauth2Client = createOAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials(savedTokens);
  return oauth2Client;
}

/**
 * OAuth2クライアントをクリア
 */
function clearOAuth2Client() {
  oauth2Client = null;
}

/**
 * OAuthコールバックサーバーを起動してHTMLレスポンスを返す
 */
function createOAuthCallbackServer(oauth2Client, mainWindow, onSuccess, onError) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost:3000');

      if (url.pathname === '/oauth2callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<html><body><h1>認証がキャンセルされました</h1><p>このウィンドウを閉じてください。</p></body></html>');
          server.close();
          onError(new Error(`認証エラー: ${error}`));
          return;
        }

        if (code) {
          try {
            // 認証コードからトークンを取得
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            config.saveTokens(tokens);

            // 成功メッセージを表示
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h1>✅ 認証に成功しました！</h1><p>このウィンドウを閉じてアプリに戻ってください。</p></body></html>');

            server.close();

            // レンダラープロセスに認証成功を通知
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('auth-success', { tokens });
            }

            onSuccess({ success: true, message: '認証が完了しました' });
          } catch (tokenError) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<html><body><h1>❌ トークン取得エラー</h1><p>このウィンドウを閉じてください。</p></body></html>');
            server.close();
            onError(tokenError);
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<html><body><h1>認証コードが見つかりません</h1></body></html>');
          server.close();
          onError(new Error('認証コードが見つかりません'));
        }
      }
    } catch (err) {
      console.error('Server error:', err);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body><h1>サーバーエラー</h1></body></html>');
      server.close();
      onError(err);
    }
  });

  return server;
}

/**
 * Google Drive認証を初期化（自動ブラウザ起動 & コールバック処理）
 */
async function initGoogleAuth(credentials, mainWindow) {
  let server = null;

  try {
    const clientId = config.CLIENT_ID || credentials.clientId;
    const clientSecret = config.CLIENT_SECRET || credentials.clientSecret;
    const redirectUri = 'http://localhost:3000/oauth2callback';

    if (!clientId || !clientSecret) {
      throw new Error('Client IDとClient Secretが設定されていません');
    }

    // 認証情報を保存
    config.saveCredentials(credentials.clientId, credentials.clientSecret);

    // OAuth2クライアントを作成
    const client = createOAuth2Client(clientId, clientSecret, redirectUri);

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file']
    });

    // ローカルサーバーを起動してOAuthコールバックを受け取る
    return new Promise((resolve, reject) => {
      server = createOAuthCallbackServer(client, mainWindow, resolve, reject);

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
    throw error;
  }
}

/**
 * 認証コードからトークンを取得
 */
async function exchangeAuthCode(code) {
  if (!oauth2Client) {
    throw new Error('OAuth2クライアントが初期化されていません');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  config.saveTokens(tokens);

  return tokens;
}

module.exports = {
  getOAuth2Client,
  createOAuth2Client,
  restoreOAuth2Client,
  clearOAuth2Client,
  initGoogleAuth,
  exchangeAuthCode
};
