/**
 * アプリケーションの状態管理
 */
class AppState {
  constructor() {
    this.selectedFilePath = null;
    this.convertedFilePath = null;
    this.isAuthenticated = false;
    this.tokens = null;
    this.configuredTsvPath = null; // 設定されたTSVファイルパス
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

  setConfiguredTsvPath(path) {
    this.configuredTsvPath = path;
    if (path) {
      localStorage.setItem('configuredTsvPath', path);
    } else {
      localStorage.removeItem('configuredTsvPath');
    }
  }

  loadConfiguredTsvPath() {
    const path = localStorage.getItem('configuredTsvPath');
    if (path) {
      this.configuredTsvPath = path;
    }
    return path;
  }

  isSetupComplete() {
    return this.configuredTsvPath && this.isAuthenticated;
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
