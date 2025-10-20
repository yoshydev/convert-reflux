/**
 * 設定の保存と読み込み
 */

/**
 * 出力ファイル名をLocalStorageに保存
 */
export function saveOutputFileName(fileName) {
  const settings = {
    outputFileName: fileName
  };
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

/**
 * LocalStorageから出力ファイル名を取得
 */
export function loadOutputFileName() {
  try {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.outputFileName || '';
    }
  } catch (e) {
    console.error('設定の読み込みエラー:', e);
  }
  return '';
}

/**
 * 設定を初期化
 */
export async function initializeSettings(elements, state) {
  try {
    // ビルド時の設定を確認
    const buildConfig = await window.electronAPI.getBuildConfig();

    if (buildConfig.hasClientId && buildConfig.hasClientSecret) {
      // ビルド時に認証情報が埋め込まれている場合
      elements.showBuildConfigStatus();
      elements.disableCredentialsForm();
      elements.updateAuthStatus(
        '認証情報が設定されています。「Google Drive 認証」ボタンをクリックしてください。',
        'success'
      );
    } else {
      // ビルド時の認証情報がない場合、ストアから取得
      const credentials = await window.electronAPI.getCredentials();

      if (credentials.clientId) {
        elements.clientId.value = credentials.clientId;
        elements.updateAuthStatus('認証情報が保存されています（暗号化済み）', 'success');
      }
      if (credentials.clientSecret) {
        elements.clientSecret.value = '********'; // マスク表示
      }
    }

    // LocalStorageから出力ファイル名を取得
    const outputFileName = loadOutputFileName();
    if (outputFileName) {
      elements.outputFileName.value = outputFileName;
    }

    // 保存されたトークンで認証を試みる
    const result = await window.electronAPI.setTokens();
    if (result.success) {
      state.setAuthenticated(true);
      elements.updateAuthStatus('認証済み（保存されたトークンを使用）', 'success');
      elements.uploadBtn.disabled = false;
    }
  } catch (e) {
    console.error('設定の読み込みエラー:', e);
  }
}
