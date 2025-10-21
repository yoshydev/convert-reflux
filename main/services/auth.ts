import { google } from 'googleapis';
import { shell, BrowserWindow } from 'electron';
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import * as config from '../utils/config';
import { isWSL, openUrlInWSL } from '../utils/wsl';

let oauth2Client: any = null;
let authPageTemplate: string | null = null;

/**
 * 認証ページのHTMLテンプレートを読み込む
 */
function loadAuthPageTemplate(): string {
    if (!authPageTemplate) {
        const templatePath = path.join(__dirname, 'auth-page.html');
        const fsSync = require('fs');
        authPageTemplate = fsSync.readFileSync(templatePath, 'utf-8');
    }
    return authPageTemplate;
}

/**
 * 認証結果ページのHTMLを生成
 * @param type - 'success', 'error', 'cancelled'
 * @returns HTML文字列
 */
function getAuthPageHTML(type: 'success' | 'error' | 'cancelled'): string {
    const contents = {
        success: {
            icon: '✓',
            iconClass: 'success',
            title: '認証が完了しました！',
            message: 'Google Driveへの接続に成功しました。',
            instruction: 'このウィンドウを閉じて、アプリに戻ってファイルのアップロードを開始できます。'
        },
        error: {
            icon: '✕',
            iconClass: 'error',
            title: '認証に失敗しました',
            message: '認証処理中にエラーが発生しました。',
            instruction: 'このウィンドウを閉じて、アプリから再度認証をお試しください。問題が解決しない場合は、設定をご確認ください。'
        },
        cancelled: {
            icon: '!',
            iconClass: 'cancelled',
            title: '認証がキャンセルされました',
            message: '認証プロセスが中断されました。',
            instruction: 'このウィンドウを閉じて、もう一度認証を行う場合はアプリから操作してください。'
        }
    };

    const content = contents[type] || contents.error;
    const template = loadAuthPageTemplate();

    // テンプレートのプレースホルダーを置換
    return template
        .replace(/\{\{TITLE\}\}/g, content.title)
        .replace(/\{\{ICON\}\}/g, content.icon)
        .replace(/\{\{ICON_CLASS\}\}/g, content.iconClass)
        .replace(/\{\{MESSAGE\}\}/g, content.message)
        .replace(/\{\{INSTRUCTION\}\}/g, content.instruction);
}

/**
 * OAuth2クライアントを取得
 */
export function getOAuth2Client(): any {
    return oauth2Client;
}

/**
 * OAuth2クライアントを初期化
 */
export function createOAuth2Client(
    clientId: string,
    clientSecret: string,
    redirectUri: string = 'http://localhost:3000/oauth2callback'
): any {
    oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    return oauth2Client;
}

/**
 * 保存されたトークンでOAuth2クライアントを復元
 */
export function restoreOAuth2Client(tokens?: any): any {
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
export function clearOAuth2Client(): void {
    oauth2Client = null;
}

/**
 * OAuthコールバックサーバーを起動してHTMLレスポンスを返す
 */
function createOAuthCallbackServer(
    oauth2Client: any,
    mainWindow: BrowserWindow,
    onSuccess: (result: any) => void,
    onError: (error: Error) => void
): http.Server {
    const server = http.createServer(async (req, res) => {
        try {
            const url = new URL(req.url || '', 'http://localhost:3000');

            if (url.pathname === '/oauth2callback') {
                const code = url.searchParams.get('code');
                const error = url.searchParams.get('error');

                if (error) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(getAuthPageHTML('cancelled'));
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
                        res.end(getAuthPageHTML('success'));

                        server.close();

                        // レンダラープロセスに認証成功を通知
                        if (mainWindow && mainWindow.webContents) {
                            mainWindow.webContents.send('auth-success', { tokens });
                        }

                        onSuccess({ success: true, message: '認証が完了しました' });
                    } catch (tokenError) {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(getAuthPageHTML('error'));
                        server.close();
                        onError(tokenError as Error);
                    }
                } else {
                    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(getAuthPageHTML('error'));
                    server.close();
                    onError(new Error('認証コードが見つかりません'));
                }
            }
        } catch (err) {
            console.error('Server error:', err);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(getAuthPageHTML('error'));
            server.close();
            onError(err as Error);
        }
    });

    return server;
}

/**
 * Google Drive認証を初期化（自動ブラウザ起動 & コールバック処理）
 */
export async function initGoogleAuth(
    credentials: { clientId?: string; clientSecret?: string },
    mainWindow: BrowserWindow
): Promise<any> {
    let server: http.Server | null = null;

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

            server.on('error', (err: Error) => {
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
                if (server && (server as any).listening) {
                    server.close();
                    reject(new Error('認証がタイムアウトしました（5分）'));
                }
            }, 5 * 60 * 1000);
        });
    } catch (error) {
        if (server && (server as any).listening) {
            server.close();
        }
        console.error('Auth init error:', error);
        throw error;
    }
}
