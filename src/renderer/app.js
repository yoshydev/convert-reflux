/**
 * アプリケーションのメインエントリーポイント
 */
import state from './state.js';
import elements from './dom.js';
import { initializeSettings, updateSetupStatus } from './settings.js';
import {
  handleAuthenticate,
  handleAuthSuccess,
  handleDisconnect
} from './handlers/auth-handler.js';
import { handleUpload } from './handlers/upload-handler.js';

/**
 * イベントリスナーを登録
 */
function registerEventListeners() {
  // タブ切り替え
  elements.settingsTab.addEventListener('click', () => {
    elements.switchTab('settings');
  });

  elements.uploadTab.addEventListener('click', () => {
    if (!elements.uploadTab.disabled) {
      elements.switchTab('upload');
    }
  });

  // TSVファイルパス設定
  elements.browseTsvBtn.addEventListener('click', async () => {
    try {
      const filePath = await window.electronAPI.selectFile();
      if (filePath) {
        state.setConfiguredTsvPath(filePath);
        elements.setTsvPath(filePath);
        updateSetupStatus(elements, state);
        elements.updateStatus('TSVファイルパスを設定しました', 'success');
      }
    } catch (error) {
      console.error('ファイル選択エラー:', error);
      elements.updateStatus('ファイル選択に失敗しました: ' + error.message, 'error');
    }
  });

  // 設定画面に戻る
  elements.editSettingsBtn.addEventListener('click', () => {
    elements.switchTab('settings');
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
  elements.uploadBtn.addEventListener('click', () => {
    handleUpload(elements, state);
  });

  // 認証成功イベント
  window.electronAPI.onAuthSuccess((data) => {
    handleAuthSuccess(elements, state, data);
    updateSetupStatus(elements, state);
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

  // 初期メッセージを表示と初期タブ設定
  if (state.isSetupComplete()) {
    elements.switchTab('upload');
    elements.updateStatus('ファイルをアップロードできます', 'success');
  } else {
    elements.updateStatus('設定を完了してください', 'info');
  }
}

// アプリケーション起動
initializeApp();
