const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBuildConfig: () => ipcRenderer.invoke('get-build-config'),
  selectFile: () => ipcRenderer.invoke('select-tsv-file'), // TSVファイル選択（汎用）
  selectTsvFile: () => ipcRenderer.invoke('select-tsv-file'),
  convertTsvToCsv: (tsvPath, outputFileName) => ipcRenderer.invoke('convert-tsv-to-csv', tsvPath, outputFileName),
  saveCredentials: (credentials) => ipcRenderer.invoke('save-credentials', credentials),
  getCredentials: () => ipcRenderer.invoke('get-credentials'),
  clearCredentials: () => ipcRenderer.invoke('clear-credentials'),
  resetFolder: () => ipcRenderer.invoke('reset-folder'),
  initGoogleAuth: (credentials) => ipcRenderer.invoke('init-google-auth', credentials),
  exchangeAuthCode: (code) => ipcRenderer.invoke('exchange-auth-code', code),
  setTokens: (tokens) => ipcRenderer.invoke('set-tokens', tokens),
  uploadToDrive: (data) => ipcRenderer.invoke('upload-to-drive', data),
  saveDialog: (defaultName) => ipcRenderer.invoke('save-dialog', defaultName),
  // 認証成功イベントのリスナー
  onAuthSuccess: (callback) => ipcRenderer.on('auth-success', (event, data) => callback(data))
});
