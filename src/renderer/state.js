/**
 * アプリケーションの状態管理
 */
class AppState {
  constructor() {
    this.selectedFilePath = null;
    this.convertedFilePath = null;
    this.isAuthenticated = false;
    this.tokens = null;
  }

  setSelectedFile(filePath) {
    this.selectedFilePath = filePath;
  }

  setConvertedFile(filePath) {
    this.convertedFilePath = filePath;
  }

  setAuthenticated(isAuthenticated) {
    this.isAuthenticated = isAuthenticated;
  }

  setTokens(tokens) {
    this.tokens = tokens;
  }

  reset() {
    this.selectedFilePath = null;
    this.convertedFilePath = null;
    this.isAuthenticated = false;
    this.tokens = null;
  }
}

// シングルトンインスタンス
const state = new AppState();

export default state;
