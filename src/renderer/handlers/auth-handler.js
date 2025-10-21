/**
 * 認証関連のイベントハンドラー
 */
import { updateSetupStatus } from '../settings.js';

/**
 * Google Drive認証ハンドラー
 */
export async function handleAuthenticate(elements, state) {
  try {
    elements.authenticateBtn.disabled = true;
    elements.updateAuthStatus('ブラウザを起動して認証中...', 'info');

    // ビルド設定を確認（ビルド時の認証情報埋め込みがあればそれを使用）
    const buildConfig = await window.electronAPI.getBuildConfig();
    const credentials = {};

    if (!buildConfig.hasClientId || !buildConfig.hasClientSecret) {
      elements.updateAuthStatus('ビルド設定が不完全です。build-config.jsを確認してください', 'error');
      elements.authenticateBtn.disabled = false;
      return;
    }

    elements.updateAuthStatus('ブラウザが開きます。Googleアカウントで認証してください...', 'info');

    const result = await window.electronAPI.initGoogleAuth(credentials);

    if (result.success) {
      // 認証成功
      state.setAuthenticated(true);
      elements.updateAuthStatus('✓ 認証成功! Google Driveにアップロードできます。', 'success');
      elements.updateAuthUI(true);
      updateSetupStatus(elements, state);

      if (state.convertedFilePath) {
        elements.uploadBtn.disabled = false;
      }

      elements.authenticateBtn.disabled = false;
    } else {
      elements.updateAuthStatus(`認証エラー: ${result.error}`, 'error');
      elements.authenticateBtn.disabled = false;
    }
  } catch (error) {
    elements.updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.authenticateBtn.disabled = false;
  }
}

/**
 * 認証成功イベントハンドラー
 */
export function handleAuthSuccess(elements, state, data) {
  console.log('認証成功:', data);
  state.setAuthenticated(true);
  elements.updateAuthUI(true);
  elements.updateAuthStatus('✓ 認証成功! Google Driveにアップロードできます。', 'success');
  updateSetupStatus(elements, state);

  if (state.convertedFilePath) {
    elements.uploadBtn.disabled = false;
  }

  elements.authenticateBtn.disabled = false;
}

/**
 * 連携解除ハンドラー
 */
export async function handleDisconnect(elements, state) {
  if (!confirm('Google Driveとの連携を解除しますか？\n保存されている認証情報とトークンがすべて削除されます。')) {
    return;
  }

  try {
    elements.disconnectBtn.disabled = true;
    elements.updateAuthStatus('連携を解除中...', 'info');

    const result = await window.electronAPI.clearCredentials();

    if (result.success) {
      state.setAuthenticated(false);
      state.setTokens(null);

      elements.updateAuthStatus('連携を解除しました', 'warning');
      elements.updateAuthUI(false);
      updateSetupStatus(elements, state);
      elements.uploadBtn.disabled = true;
      elements.disconnectBtn.disabled = false;
    } else {
      elements.updateAuthStatus(`エラー: ${result.error}`, 'error');
      elements.disconnectBtn.disabled = false;
    }
  } catch (error) {
    elements.updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.disconnectBtn.disabled = false;
  }
}

