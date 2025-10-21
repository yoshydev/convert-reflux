/**
 * DOM要素の管理
 */
class DOMElements {
  constructor() {
    // タブとビュー
    this.settingsTab = document.getElementById('settingsTab');
    this.uploadTab = document.getElementById('uploadTab');
    this.settingsView = document.getElementById('settingsView');
    this.uploadView = document.getElementById('uploadView');

    // 設定画面の要素
    this.tsvPathInput = document.getElementById('tsvPath');
    this.browseTsvBtn = document.getElementById('browseTsvBtn');
    this.tsvPathStatus = document.getElementById('tsvPathStatus');
    this.setupItemTsv = document.getElementById('setupItemTsv');
    this.setupItemAuth = document.getElementById('setupItemAuth');
    this.setupMessage = document.getElementById('setupMessage');

    // アップロード画面の要素
    this.selectFileBtn = document.getElementById('selectFile');
    this.useConfiguredFileBtn = document.getElementById('useConfiguredFile');
    this.editSettingsBtn = document.getElementById('editSettingsBtn');
    this.summaryTsvPath = document.getElementById('summaryTsvPath');
    this.summaryAuthStatus = document.getElementById('summaryAuthStatus');

    // 共通要素
    this.authenticateBtn = document.getElementById('authenticateBtn');
    this.disconnectBtn = document.getElementById('disconnectBtn');
    this.uploadBtn = document.getElementById('uploadBtn');
    this.selectedFileDiv = document.getElementById('selectedFile');
    this.statusDiv = document.getElementById('status');
    this.authStatusDiv = document.getElementById('authStatus');
  }

  /**
   * ステータスメッセージを更新
   */
  updateStatus(message, type = 'info') {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status-box ${type}`;
    console.log(`[${type.toUpperCase()}]`, message);
  }

  /**
   * 認証ステータスを更新
   */
  updateAuthStatus(message, type = 'info') {
    this.authStatusDiv.textContent = message;
    this.authStatusDiv.className = `info-box ${type}`;
  }

  /**
   * 選択されたファイル情報を表示
   */
  showSelectedFile(filePath) {
    const fileName = filePath.split(/[\\/]/).pop();
    this.selectedFileDiv.textContent = `選択されたファイル: ${fileName}\nパス: ${filePath}`;
    this.selectedFileDiv.className = 'info-box success';
  }

  /**
   * 認証状態に応じてUIを更新
   */
  updateAuthUI(isAuthenticated) {
    if (isAuthenticated) {
      this.authenticateBtn.style.display = 'none';
      this.disconnectBtn.style.display = 'inline-block';
      this.setupItemAuth.classList.add('completed');
      this.summaryAuthStatus.textContent = '認証済み ✓';
      this.summaryAuthStatus.style.color = '#48bb78';
    } else {
      this.authenticateBtn.style.display = 'inline-block';
      this.disconnectBtn.style.display = 'none';
      this.setupItemAuth.classList.remove('completed');
      this.summaryAuthStatus.textContent = '未認証';
      this.summaryAuthStatus.style.color = '#f56565';
    }
  }

  /**
   * TSVファイルパスを設定
   */
  setTsvPath(filePath) {
    this.tsvPathInput.value = filePath;
    const fileName = filePath.split(/[\\/]/).pop();
    this.tsvPathStatus.textContent = `設定完了: ${fileName}`;
    this.tsvPathStatus.className = 'info-box success';
    this.tsvPathStatus.style.display = 'block';
    this.setupItemTsv.classList.add('completed');
    this.summaryTsvPath.textContent = fileName;
    this.summaryTsvPath.style.color = '#48bb78';
  }

  /**
   * TSVファイルパスをクリア
   */
  clearTsvPath() {
    this.tsvPathInput.value = '';
    this.tsvPathStatus.style.display = 'none';
    this.setupItemTsv.classList.remove('completed');
    this.summaryTsvPath.textContent = '未設定';
    this.summaryTsvPath.style.color = '#f56565';
  }

  /**
   * タブを切り替え
   */
  switchTab(tabName) {
    if (tabName === 'settings') {
      this.settingsTab.classList.add('active');
      this.uploadTab.classList.remove('active');
      this.settingsView.classList.add('active');
      this.uploadView.classList.remove('active');
    } else if (tabName === 'upload') {
      this.settingsTab.classList.remove('active');
      this.uploadTab.classList.add('active');
      this.settingsView.classList.remove('active');
      this.uploadView.classList.add('active');
    }
  }

  /**
   * セットアップ状況を更新
   */
  updateSetupStatus(tsvConfigured, authCompleted) {
    const allComplete = tsvConfigured && authCompleted;

    if (allComplete) {
      this.setupMessage.textContent = '✓ セットアップ完了！アップロードタブに移動できます';
      this.setupMessage.className = 'setup-message success';
      this.uploadTab.disabled = false;
    } else {
      const missing = [];
      if (!tsvConfigured) missing.push('TSVファイルパス');
      if (!authCompleted) missing.push('Google Drive認証');
      this.setupMessage.textContent = `未完了: ${missing.join('、')}`;
      this.setupMessage.className = 'setup-message warning';
      this.uploadTab.disabled = true;
    }

    return allComplete;
  }
}

// シングルトンインスタンス
const elements = new DOMElements();

export default elements;
