// アプリケーションの状態
let state = {
  selectedFilePath: null,
  convertedFilePath: null,
  isAuthenticated: false,
  tokens: null
};

// DOM要素の取得
const elements = {
  selectFileBtn: document.getElementById('selectFile'),
  convertBtn: document.getElementById('convertBtn'),
  saveCredentialsBtn: document.getElementById('saveCredentialsBtn'),
  authenticateBtn: document.getElementById('authenticateBtn'),
  clearCredentialsBtn: document.getElementById('clearCredentialsBtn'),
  resetFolderBtn: document.getElementById('resetFolderBtn'),
  uploadBtn: document.getElementById('uploadBtn'),
  selectedFileDiv: document.getElementById('selectedFile'),
  statusDiv: document.getElementById('status'),
  authStatusDiv: document.getElementById('authStatus'),
  buildConfigStatus: document.getElementById('buildConfigStatus'),
  credentialsForm: document.getElementById('credentialsForm'),
  outputFileName: document.getElementById('outputFileName'),
  clientId: document.getElementById('clientId'),
  clientSecret: document.getElementById('clientSecret')
};

// Electron Storeから設定を読み込み
async function loadSettings() {
  try {
    // ビルド時の設定を確認
    const buildConfig = await window.electronAPI.getBuildConfig();

    if (buildConfig.hasClientId && buildConfig.hasClientSecret) {
      // ビルド時に認証情報が埋め込まれている場合
      elements.buildConfigStatus.style.display = 'block';
      elements.buildConfigStatus.className = 'info-box success';
      elements.buildConfigStatus.textContent = '✅ ビルド時に認証情報が埋め込まれています。入力は不要です。';

      // フォーム入力を無効化
      elements.clientId.disabled = true;
      elements.clientSecret.disabled = true;
      elements.clientId.value = '*** ビルド時設定 ***';
      elements.clientSecret.value = '*** ビルド時設定 ***';
      elements.saveCredentialsBtn.disabled = true;
      elements.clearCredentialsBtn.disabled = true;

      updateAuthStatus('認証情報が設定されています。「Google Drive 認証」ボタンをクリックしてください。', 'success');
    } else {
      // ビルド時の認証情報がない場合、ストアから取得
      const credentials = await window.electronAPI.getCredentials();

      if (credentials.clientId) {
        elements.clientId.value = credentials.clientId;
        updateAuthStatus('認証情報が保存されています（暗号化済み）', 'success');
      }
      if (credentials.clientSecret) {
        elements.clientSecret.value = '********'; // マスク表示
      }
    }

    // LocalStorageから出力ファイル名のみ取得（機密情報ではないため）
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.outputFileName) elements.outputFileName.value = settings.outputFileName;
      } catch (e) {
        console.error('設定の読み込みエラー:', e);
      }
    }

    // 保存されたトークンで認証を試みる
    const result = await window.electronAPI.setTokens();
    if (result.success) {
      state.isAuthenticated = true;
      updateAuthStatus('認証済み（保存されたトークンを使用）', 'success');
      elements.uploadBtn.disabled = false;
    }
  } catch (e) {
    console.error('設定の読み込みエラー:', e);
  }
}

// 出力ファイル名のみLocalStorageに保存
function saveOutputFileName() {
  const settings = {
    outputFileName: elements.outputFileName.value
  };
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

// ステータス更新
function updateStatus(message, type = 'info') {
  elements.statusDiv.textContent = message;
  elements.statusDiv.className = `status-box ${type}`;
  console.log(`[${type.toUpperCase()}]`, message);
}

// 認証ステータス更新
function updateAuthStatus(message, type = 'info') {
  elements.authStatusDiv.textContent = message;
  elements.authStatusDiv.className = `info-box ${type}`;
}

// ファイル選択
elements.selectFileBtn.addEventListener('click', async () => {
  try {
    const filePath = await window.electronAPI.selectTsvFile();

    if (filePath) {
      state.selectedFilePath = filePath;
      const fileName = filePath.split(/[\\/]/).pop();
      elements.selectedFileDiv.textContent = `選択されたファイル: ${fileName}\nパス: ${filePath}`;
      elements.selectedFileDiv.className = 'info-box success';
      elements.convertBtn.disabled = false;
      updateStatus('ファイルが選択されました。変換ボタンをクリックしてください。', 'success');
    }
  } catch (error) {
    updateStatus(`エラー: ${error.message}`, 'error');
  }
});

// CSV変換
elements.convertBtn.addEventListener('click', async () => {
  if (!state.selectedFilePath) {
    updateStatus('先にTSVファイルを選択してください', 'warning');
    return;
  }

  try {
    elements.convertBtn.disabled = true;
    updateStatus('変換中...', 'info');

    const outputFileName = elements.outputFileName.value.trim() || null;
    const result = await window.electronAPI.convertTsvToCsv(state.selectedFilePath, outputFileName);

    if (result.success) {
      state.convertedFilePath = result.csvPath;
      updateStatus(
        `✓ CSV変換完了!\n出力ファイル: ${result.fileName}\nパス: ${result.csvPath}`,
        'success'
      );

      if (state.isAuthenticated) {
        elements.uploadBtn.disabled = false;
      }

      saveOutputFileName();
    } else {
      updateStatus(`変換エラー: ${result.error}`, 'error');
      elements.convertBtn.disabled = false;
    }
  } catch (error) {
    updateStatus(`エラー: ${error.message}`, 'error');
    elements.convertBtn.disabled = false;
  }
});

// 認証情報を保存
elements.saveCredentialsBtn.addEventListener('click', async () => {
  const clientId = elements.clientId.value.trim();
  const clientSecret = elements.clientSecret.value.trim();

  if (!clientId || !clientSecret) {
    updateAuthStatus('Client IDとClient Secretを入力してください', 'warning');
    return;
  }

  // Client Secretが既にマスクされている場合はスキップ
  if (clientSecret === '********') {
    updateAuthStatus('認証情報は既に保存されています', 'info');
    return;
  }

  try {
    elements.saveCredentialsBtn.disabled = true;
    updateAuthStatus('認証情報を暗号化して保存中...', 'info');

    const result = await window.electronAPI.saveCredentials({
      clientId,
      clientSecret
    });

    if (result.success) {
      updateAuthStatus('✓ 認証情報を暗号化して保存しました', 'success');
      // Client Secretをマスク表示
      elements.clientSecret.value = '********';
      elements.saveCredentialsBtn.disabled = false;
    } else {
      updateAuthStatus(`保存エラー: ${result.error}`, 'error');
      elements.saveCredentialsBtn.disabled = false;
    }
  } catch (error) {
    updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.saveCredentialsBtn.disabled = false;
  }
});

// Google Drive 認証（自動ブラウザ起動）
elements.authenticateBtn.addEventListener('click', async () => {
  try {
    elements.authenticateBtn.disabled = true;
    updateAuthStatus('ブラウザを起動して認証中...', 'info');

    // ビルド設定を確認
    const buildConfig = await window.electronAPI.getBuildConfig();

    // ビルド時の設定がある場合は空のcredentialsを渡す（main.jsで処理）
    // ない場合は保存された認証情報を取得
    let credentials = {};

    if (!buildConfig.hasClientId || !buildConfig.hasClientSecret) {
      const savedCredentials = await window.electronAPI.getCredentials();

      if (!savedCredentials.clientId || !savedCredentials.clientSecret) {
        updateAuthStatus('先に認証情報を保存してください', 'warning');
        elements.authenticateBtn.disabled = false;
        return;
      }

      credentials = {
        clientId: savedCredentials.clientId,
        clientSecret: savedCredentials.clientSecret
      };
    }

    updateAuthStatus('ブラウザが開きます。Googleアカウントで認証してください...', 'info');

    const result = await window.electronAPI.initGoogleAuth({
      ...credentials
    });

    if (result.success) {
      // 認証成功（自動で完了）
      state.isAuthenticated = true;
      updateAuthStatus('✓ 認証成功! Google Driveにアップロードできます。', 'success');

      if (state.convertedFilePath) {
        elements.uploadBtn.disabled = false;
      }

      elements.authenticateBtn.disabled = false;
    } else {
      updateAuthStatus(`認証エラー: ${result.error}`, 'error');
      elements.authenticateBtn.disabled = false;
    }
  } catch (error) {
    updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.authenticateBtn.disabled = false;
  }
});

// 認証情報をクリア
elements.clearCredentialsBtn.addEventListener('click', async () => {
  if (!confirm('保存されている認証情報とトークンをすべて削除しますか？')) {
    return;
  }

  try {
    elements.clearCredentialsBtn.disabled = true;
    updateAuthStatus('認証情報をクリア中...', 'info');

    const result = await window.electronAPI.clearCredentials();

    if (result.success) {
      // フォームをクリア
      elements.clientId.value = '';
      elements.clientSecret.value = '';

      state.isAuthenticated = false;
      state.tokens = null;

      updateAuthStatus('✓ 認証情報をクリアしました（フォルダは保持されます）', 'success');
      elements.uploadBtn.disabled = true;
      elements.clearCredentialsBtn.disabled = false;
    } else {
      updateAuthStatus(`クリアエラー: ${result.error}`, 'error');
      elements.clearCredentialsBtn.disabled = false;
    }
  } catch (error) {
    updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.clearCredentialsBtn.disabled = false;
  }
});

// フォルダをリセット
elements.resetFolderBtn.addEventListener('click', async () => {
  if (!confirm('保存されているフォルダ情報をリセットしますか？\n次回アップロード時に新しいフォルダが使用されます。')) {
    return;
  }

  try {
    elements.resetFolderBtn.disabled = true;
    updateAuthStatus('フォルダ情報をリセット中...', 'info');

    const result = await window.electronAPI.resetFolder();

    if (result.success) {
      updateAuthStatus('✓ フォルダ情報をリセットしました。次回アップロード時に新しいフォルダが作成/検索されます。', 'success');
      elements.resetFolderBtn.disabled = false;
    } else {
      updateAuthStatus(`リセットエラー: ${result.error}`, 'error');
      elements.resetFolderBtn.disabled = false;
    }
  } catch (error) {
    updateAuthStatus(`エラー: ${error.message}`, 'error');
    elements.resetFolderBtn.disabled = false;
  }
});

// Google Driveアップロード
elements.uploadBtn.addEventListener('click', async () => {
  if (!state.convertedFilePath) {
    updateStatus('先にファイルを変換してください', 'warning');
    return;
  }

  if (!state.isAuthenticated) {
    updateStatus('先にGoogle Drive認証を完了してください', 'warning');
    return;
  }

  try {
    elements.uploadBtn.disabled = true;
    updateStatus('Google Driveにアップロード中...', 'info');

    // 保存されたトークンを設定
    await window.electronAPI.setTokens();

    const outputFileName = elements.outputFileName.value.trim() || null;

    const result = await window.electronAPI.uploadToDrive({
      filePath: state.convertedFilePath,
      fileName: outputFileName
    });

    if (result.success) {
      const actionText = result.action === 'updated' ? '更新' : '作成';
      updateStatus(
        `✓ Google Driveに${actionText}しました!\n` +
        `フォルダ: ${result.folderInfo.name}\n` +
        `ファイル名: ${result.fileInfo.name}\n` +
        `ファイルID: ${result.fileInfo.id}\n` +
        `更新日時: ${result.fileInfo.modifiedTime}\n` +
        (result.fileInfo.webViewLink ? `ファイルURL: ${result.fileInfo.webViewLink}\n` : '') +
        (result.folderInfo.webViewLink ? `フォルダURL: ${result.folderInfo.webViewLink}` : ''),
        'success'
      );
      elements.uploadBtn.disabled = false;
    } else {
      updateStatus(`アップロードエラー: ${result.error}`, 'error');
      elements.uploadBtn.disabled = false;
    }
  } catch (error) {
    updateStatus(`エラー: ${error.message}`, 'error');
    elements.uploadBtn.disabled = false;
  }
});

// 初期化
loadSettings();
updateStatus('TSVファイルを選択してください', 'info');

// 認証成功イベントのリスナー
window.electronAPI.onAuthSuccess((data) => {
  console.log('認証成功:', data);
  state.isAuthenticated = true;
  updateAuthStatus('✓ 認証成功! Google Driveにアップロードできます。', 'success');

  if (state.convertedFilePath) {
    elements.uploadBtn.disabled = false;
  }

  elements.authenticateBtn.disabled = false;
});
