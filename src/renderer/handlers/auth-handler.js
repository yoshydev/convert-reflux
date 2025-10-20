/**
 * 認証関連のイベントハンドラー
 */

/**
 * 認証情報保存ハンドラー
 */
export async function handleSaveCredentials(elements) {
  const clientId = elements.clientId.value.trim();
  const clientSecret = elements.clientSecret.value.trim();

  if (!clientId || !clientSecret) {
    elements.updateAuthStatus('Client IDとClient Secretを入力してください', 'warning');
    return;
  }

  // Client Secretが既にマスクされている場合はスキップ
  if (clientSecret === '********') {
    elements.updateAuthStatus('認証情報は既に保存されています', 'info');
    return;
  }

  try {
    elements.saveCredentialsBtn.disabled = true;
    elements.updateAuthStatus('認証情報を暗号化して保存中...', 'info');

    const result = await window.electronAPI.saveCredentials({
      clientId,
      clientSecret
    });

    if (result.success) {
      elements.updateAuthStatus('✓ 認証情報を暗号化して保存しました', 'success');
      // Client Secretをマスク表示
      elements.clientSecret.value = '********';
      elements.saveCredentialsBtn.disabled = false;
    } else {
      elements.updateAuthStatus(`保存エラー: ${result.error}`, 'error');
      elements.saveCredentialsBtn.disabled = false;
    }
  } catch (error) {
    elements.updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.saveCredentialsBtn.disabled = false;
  }
}

/**
 * Google Drive認証ハンドラー
 */
export async function handleAuthenticate(elements, state) {
  try {
    elements.authenticateBtn.disabled = true;
    elements.updateAuthStatus('ブラウザを起動して認証中...', 'info');

    // ビルド設定を確認
    const buildConfig = await window.electronAPI.getBuildConfig();

    // ビルド時の設定がある場合は空のcredentialsを渡す
    // ない場合は保存された認証情報を取得
    let credentials = {};

    if (!buildConfig.hasClientId || !buildConfig.hasClientSecret) {
      const savedCredentials = await window.electronAPI.getCredentials();

      if (!savedCredentials.clientId || !savedCredentials.clientSecret) {
        elements.updateAuthStatus('先に認証情報を保存してください', 'warning');
        elements.authenticateBtn.disabled = false;
        return;
      }

      credentials = {
        clientId: savedCredentials.clientId,
        clientSecret: savedCredentials.clientSecret
      };
    }

    elements.updateAuthStatus('ブラウザが開きます。Googleアカウントで認証してください...', 'info');

    const result = await window.electronAPI.initGoogleAuth({
      ...credentials
    });

    if (result.success) {
      // 認証成功
      state.setAuthenticated(true);
      elements.updateAuthStatus('✓ 認証成功! Google Driveにアップロードできます。', 'success');

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
 * 認証情報クリアハンドラー
 */
export async function handleClearCredentials(elements, state) {
  if (!confirm('保存されている認証情報とトークンをすべて削除しますか？')) {
    return;
  }

  try {
    elements.clearCredentialsBtn.disabled = true;
    elements.updateAuthStatus('認証情報をクリア中...', 'info');

    const result = await window.electronAPI.clearCredentials();

    if (result.success) {
      // フォームをクリア
      elements.clearCredentialsForm();

      state.setAuthenticated(false);
      state.setTokens(null);

      elements.updateAuthStatus('✓ 認証情報をクリアしました（フォルダは保持されます）', 'success');
      elements.uploadBtn.disabled = true;
      elements.clearCredentialsBtn.disabled = false;
    } else {
      elements.updateAuthStatus(`クリアエラー: ${result.error}`, 'error');
      elements.clearCredentialsBtn.disabled = false;
    }
  } catch (error) {
    elements.updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.clearCredentialsBtn.disabled = false;
  }
}

/**
 * フォルダリセットハンドラー
 */
export async function handleResetFolder(elements) {
  if (!confirm('保存されているフォルダ情報をリセットしますか？\n次回アップロード時に新しいフォルダが使用されます。')) {
    return;
  }

  try {
    elements.resetFolderBtn.disabled = true;
    elements.updateAuthStatus('フォルダ情報をリセット中...', 'info');

    const result = await window.electronAPI.resetFolder();

    if (result.success) {
      elements.updateAuthStatus('✓ フォルダ情報をリセットしました。次回アップロード時に新しいフォルダが作成/検索されます。', 'success');
      elements.resetFolderBtn.disabled = false;
    } else {
      elements.updateAuthStatus(`リセットエラー: ${result.error}`, 'error');
      elements.resetFolderBtn.disabled = false;
    }
  } catch (error) {
    elements.updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.resetFolderBtn.disabled = false;
  }
}

/**
 * 認証成功イベントハンドラー
 */
export function handleAuthSuccess(elements, state, data) {
  console.log('認証成功:', data);
  state.setAuthenticated(true);
  elements.updateAuthStatus('✓ 認証成功! Google Driveにアップロードできます。', 'success');

  if (state.convertedFilePath) {
    elements.uploadBtn.disabled = false;
  }

  elements.authenticateBtn.disabled = false;
}
