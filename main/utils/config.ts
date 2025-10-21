import { config } from 'dotenv';
import Store from 'electron-store';

// 環境変数を読み込み
config();

// 環境変数から直接取得
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

if (CLIENT_ID && CLIENT_SECRET) {
  console.log('✅ 環境変数から認証情報を読み込みました');
} else {
  console.warn('⚠️  環境変数 GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET が設定されていません');
  console.warn('   .env ファイルを作成し、以下の内容を設定してください:');
  console.warn('   GOOGLE_CLIENT_ID=your_client_id');
  console.warn('   GOOGLE_CLIENT_SECRET=your_client_secret');
}

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
  // TSVパスはクリアしない - ユーザーが設定したパス情報は保持
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
 * TSVファイルパスを保存
 */
export function saveTsvPath(tsvPath: string): void {
  store.set('app.tsvPath', tsvPath);
}

/**
 * TSVファイルパスを取得
 */
export function getTsvPath(): string | undefined {
  return store.get('app.tsvPath') as string | undefined;
}

/**
 * TSVファイルパスをクリア
 */
export function clearTsvPath(): void {
  store.delete('app.tsvPath');
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
