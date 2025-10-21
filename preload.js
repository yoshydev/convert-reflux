const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBuildConfig: () => ipcRenderer.invoke('get-build-config'),
  selectFile: () => ipcRenderer.invoke('select-tsv-file'),
  convertTsvToCsv: (tsvPath, outputFileName) => ipcRenderer.invoke('convert-tsv-to-csv', tsvPath, outputFileName),
  clearCredentials: () => ipcRenderer.invoke('clear-credentials'),
  initGoogleAuth: (credentials) => ipcRenderer.invoke('init-google-auth', credentials),
  setTokens: (tokens) => ipcRenderer.invoke('set-tokens', tokens),
  uploadToDrive: (data) => ipcRenderer.invoke('upload-to-drive', data),
  onAuthSuccess: (callback) => ipcRenderer.on('auth-success', (event, data) => callback(data))
});

