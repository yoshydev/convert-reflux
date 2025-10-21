/**
 * アプリケーションのメインエントリーポイント
 */
import state from './state.js';
import elements from './dom.js';
import { initializeSettings } from './settings.js';
import { handleFileSelect } from './handlers/file-handler.js';
import {
  handleAuthenticate,
  handleAuthSuccess
} from './handlers/auth-handler.js';
import { handleUpload } from './handlers/upload-handler.js';

/**
 * イベントリスナーを登録
 */
function registerEventListeners() {
  // ファイル選択
  elements.selectFileBtn.addEventListener('click', () => {
    handleFileSelect(elements, state);
  });

  // Google Drive認証
  elements.authenticateBtn.addEventListener('click', () => {
    handleAuthenticate(elements, state);
  });

  // 連携解除
  elements.disconnectBtn.addEventListener('click', () => {
    handleDisconnect(elements, state);
  });

  // Google Driveアップロード
  // Google Driveアップロード
  elements.uploadBtn.addEventListener('click', () => {
    handleUpload(elements, state);
  });

  // 認証成功イベント
  window.electronAPI.onAuthSuccess((data) => {
    handleAuthSuccess(elements, state, data);
  });
}

/**
 * アプリケーションを初期化
 */
async function initializeApp() {
  // 設定を読み込み
  await initializeSettings(elements, state);

  // イベントリスナーを登録
  registerEventListeners();

  // 初期メッセージを表示
  elements.updateStatus('TSVファイルを選択してください', 'info');
}

// アプリケーション起動
initializeApp();
