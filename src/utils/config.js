const Store = require('electron-store');

// ビルド時に埋め込まれた設定を読み込み
let buildConfig;
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
const APP_FOLDER_NAME = 'Convert-Reflux';

// 暗号化されたストアの初期化
const store = new Store({
  encryptionKey: 'tsv-csv-converter-secure-key-2024',
  name: 'config'
});

/**
 * クライアントIDを取得
 */
function getClientId() {
  return CLIENT_ID || store.get('google.clientId') || '';
}

/**
 * クライアントシークレットを取得
 */
function getClientSecret() {
  return CLIENT_SECRET || store.get('google.clientSecret') || '';
}

/**
 * 認証情報を保存
 */
function saveCredentials(clientId, clientSecret) {
  if (!CLIENT_ID && clientId) store.set('google.clientId', clientId);
  if (!CLIENT_SECRET && clientSecret) store.set('google.clientSecret', clientSecret);
}

/**
 * 認証情報を取得
 */
function getCredentials() {
  return {
    clientId: getClientId(),
    clientSecret: getClientSecret()
  };
}

/**
 * 認証情報をクリア
 */
function clearCredentials() {
  store.delete('google.clientId');
  store.delete('google.clientSecret');
  store.delete('google.folderId');
  store.delete('google.tokens');
}

/**
 * トークンを保存
 */
function saveTokens(tokens) {
  store.set('google.tokens', tokens);
}

/**
 * トークンを取得
 */
function getTokens() {
  return store.get('google.tokens');
}

/**
 * フォルダIDを保存
 */
function saveFolderId(folderId) {
  store.set('google.folderId', folderId);
}

/**
 * フォルダIDを取得
 */
function getFolderId() {
  return store.get('google.folderId');
}

/**
 * フォルダIDをリセット
 */
function resetFolderId() {
  store.delete('google.folderId');
}

/**
 * ビルド設定を取得
 */
function getBuildConfig() {
  return {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET
  };
}

module.exports = {
  APP_FOLDER_NAME,
  CLIENT_ID,
  CLIENT_SECRET,
  getClientId,
  getClientSecret,
  saveCredentials,
  getCredentials,
  clearCredentials,
  saveTokens,
  getTokens,
  saveFolderId,
  getFolderId,
  resetFolderId,
  getBuildConfig
};
