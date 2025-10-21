/**
 * DOM要素の管理
 */
class DOMElements {
  constructor() {
    this.selectFileBtn = document.getElementById('selectFile');
    this.authenticateBtn = document.getElementById('authenticateBtn');
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
}

// シングルトンインスタンス
const elements = new DOMElements();

export default elements;
