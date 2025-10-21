/**
 * 設定の保存と読み込み
 */

/**
 * 設定を初期化
 */
export async function initializeSettings(elements, state) {
  try {
    // 保存されたTSVパスを読み込み
    const savedTsvPath = state.loadConfiguredTsvPath();
    if (savedTsvPath) {
      elements.setTsvPath(savedTsvPath);
    }

    // ビルド時の設定を確認
    const buildConfig = await window.electronAPI.getBuildConfig();

    if (buildConfig.hasClientId && buildConfig.hasClientSecret) {
      // ビルド時に認証情報が埋め込まれている場合
      elements.updateAuthStatus(
        '「Google Drive 認証」ボタンをクリックしてください。',
        'warning'
      );
    }

    // 保存されたトークンで認証を試みる
    const result = await window.electronAPI.setTokens();
    if (result.success) {
      state.setAuthenticated(true);
      elements.updateAuthStatus('認証済み（保存されたトークンを使用）', 'success');
      elements.updateAuthUI(true);
    }

    // セットアップ状況を更新
    updateSetupStatus(elements, state);
  } catch (e) {
    console.error('設定の読み込みエラー:', e);
  }
}

/**
 * セットアップ状況を確認して更新
 */
export function updateSetupStatus(elements, state) {
  const tsvConfigured = !!state.configuredTsvPath;
  const authCompleted = state.isAuthenticated;

  const isComplete = elements.updateSetupStatus(tsvConfigured, authCompleted);

  // アップロードボタンの有効化
  elements.uploadBtn.disabled = !isComplete;

  return isComplete;
}
