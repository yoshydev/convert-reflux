import Store from 'electron-store';

import { BUILD_CONFIG } from '../build-config';

// ビルド時に生成された設定から認証情報を取得
const CLIENT_ID = BUILD_CONFIG.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = BUILD_CONFIG.GOOGLE_CLIENT_SECRET;

if (CLIENT_ID && CLIENT_SECRET) {
  console.log('✅ 認証情報を読み込みました');
} else {
  console.warn('⚠️  認証情報が設定されていません');
  console.warn('   環境変数 GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET を設定してビルドしてください');
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
  return CLIENT_ID;
}

/**
 * クライアントシークレットを取得
 */
export function getClientSecret(): string {
  return CLIENT_SECRET;
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
  // クライアントIDとシークレットはビルド時埋め込みなので削除不要
  store.delete('google.folderId');
  store.delete('google.tokens');
  // TSVパスはクリアしない - ユーザーが設定したパス情報は保持
}

/**
 * トークンを保存
 */
export function saveTokens(tokens: Record<string, unknown>): void {
  store.set('google.tokens', tokens);
}

/**
 * トークンを取得
 */
export function getTokens(): Record<string, unknown> | undefined {
  return store.get('google.tokens') as Record<string, unknown> | undefined;
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
