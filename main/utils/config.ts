import Store from 'electron-store';

// ビルド時に埋め込まれた設定を読み込み
let buildConfig: { GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string };
try {
    buildConfig = require('../../config.js');
    console.log('✅ ビルド時の設定を読み込みました');
} catch (error) {
    console.warn('⚠️  config.js が見つかりません。npm start を実行してください。');
    buildConfig = {
        GOOGLE_CLIENT_ID: '',
        GOOGLE_CLIENT_SECRET: ''
    };
}

const CLIENT_ID = buildConfig.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = buildConfig.GOOGLE_CLIENT_SECRET;

// アプリ専用のフォルダ名
export const APP_FOLDER_NAME = 'Reflux-Converter';

// 暗号化されたストアの初期化
const store = new Store({
    encryptionKey: 'tsv-csv-converter-secure-key-2024',
    name: 'config'
});

/**
 * クライアントIDを取得
 */
export function getClientId(): string {
    return CLIENT_ID || (store.get('google.clientId') as string) || '';
}

/**
 * クライアントシークレットを取得
 */
export function getClientSecret(): string {
    return CLIENT_SECRET || (store.get('google.clientSecret') as string) || '';
}

/**
 * 認証情報を保存
 */
export function saveCredentials(clientId?: string, clientSecret?: string): void {
    if (!CLIENT_ID && clientId) store.set('google.clientId', clientId);
    if (!CLIENT_SECRET && clientSecret) store.set('google.clientSecret', clientSecret);
}

/**
 * 認証情報を取得
 */
export function getCredentials(): { clientId: string; clientSecret: string } {
    return {
        clientId: getClientId(),
        clientSecret: getClientSecret()
    };
}

/**
 * 認証情報をクリア
 */
export function clearCredentials(): void {
    store.delete('google.clientId');
    store.delete('google.clientSecret');
    store.delete('google.folderId');
    store.delete('google.tokens');
}

/**
 * トークンを保存
 */
export function saveTokens(tokens: any): void {
    store.set('google.tokens', tokens);
}

/**
 * トークンを取得
 */
export function getTokens(): any {
    return store.get('google.tokens');
}

/**
 * フォルダIDを保存
 */
export function saveFolderId(folderId: string): void {
    store.set('google.folderId', folderId);
}

/**
 * フォルダIDを取得
 */
export function getFolderId(): string | undefined {
    return store.get('google.folderId') as string | undefined;
}

/**
 * フォルダIDをリセット
 */
export function resetFolderId(): void {
    store.delete('google.folderId');
}

/**
 * ビルド設定を取得
 */
export function getBuildConfig(): { hasClientId: boolean; hasClientSecret: boolean } {
    return {
        hasClientId: !!CLIENT_ID,
        hasClientSecret: !!CLIENT_SECRET
    };
}

export { CLIENT_ID, CLIENT_SECRET };
