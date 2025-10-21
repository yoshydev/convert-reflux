/**
 * 設定の保存と読み込み
 */


/**
 * 設定を初期化
 */
export async function initializeSettings(elements, state) {
  try {
    // ビルド時の設定を確認
    const buildConfig = await window.electronAPI.getBuildConfig();

    if (buildConfig.hasClientId && buildConfig.hasClientSecret) {
      // ビルド時に認証情報が埋め込まれている場合
      elements.updateAuthStatus(
        '認証情報が設定されています。「Google Drive 認証」ボタンをクリックしてください。',
        'success'
      );
    }


    // 保存されたトークンで認証を試みる
    const result = await window.electronAPI.setTokens();
    if (result.success) {
      state.setAuthenticated(true);
      elements.updateAuthStatus('認証済み（保存されたトークンを使用）', 'success');
      elements.updateAuthUI(true);
      elements.uploadBtn.disabled = false;
    }
  } catch (e) {
    console.error('設定の読み込みエラー:', e);
  }
}
