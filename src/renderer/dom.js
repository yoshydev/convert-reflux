/**
 * DOM要素の管理
 */
class DOMElements {
  constructor() {
    this.selectFileBtn = document.getElementById('selectFile');
    this.saveCredentialsBtn = document.getElementById('saveCredentialsBtn');
    this.authenticateBtn = document.getElementById('authenticateBtn');
    this.clearCredentialsBtn = document.getElementById('clearCredentialsBtn');
    this.resetFolderBtn = document.getElementById('resetFolderBtn');
    this.uploadBtn = document.getElementById('uploadBtn');
    this.selectedFileDiv = document.getElementById('selectedFile');
    this.statusDiv = document.getElementById('status');
    this.authStatusDiv = document.getElementById('authStatus');
    this.buildConfigStatus = document.getElementById('buildConfigStatus');
    this.credentialsForm = document.getElementById('credentialsForm');
    this.clientId = document.getElementById('clientId');
    this.clientSecret = document.getElementById('clientSecret');
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
   * ビルド設定ステータスを表示
   */
  showBuildConfigStatus() {
    this.buildConfigStatus.style.display = 'block';
    this.buildConfigStatus.className = 'info-box success';
    this.buildConfigStatus.textContent = '✅ ビルド時に認証情報が埋め込まれています。入力は不要です。';
  }

  /**
   * 認証情報フォームを無効化
   */
  disableCredentialsForm() {
    this.clientId.disabled = true;
    this.clientSecret.disabled = true;
    this.clientId.value = '*** ビルド時設定 ***';
    this.clientSecret.value = '*** ビルド時設定 ***';
    this.saveCredentialsBtn.disabled = true;
    this.clearCredentialsBtn.disabled = true;
  }

  /**
   * 認証情報フォームをクリア
   */
  clearCredentialsForm() {
    this.clientId.value = '';
    this.clientSecret.value = '';
  }
}

// シングルトンインスタンス
const elements = new DOMElements();

export default elements;
