import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

// ElectronAPIの型定義
export interface ElectronAPI {
  // ビルド設定の取得
  getBuildConfig: () => Promise<{ hasClientId: boolean; hasClientSecret: boolean }>;

  // ファイル選択
  selectFile: () => Promise<string | null>;

  // TSVファイルパスを保存
  saveTsvPath: (tsvPath: string) => Promise<{ success: boolean; error?: string }>;

  // TSVファイルパスを取得
  getTsvPath: () => Promise<{ success: boolean; tsvPath?: string; error?: string }>;

  // TSVからCSVへの変換
  convertTsvToCsv: (tsvPath: string, outputFileName?: string) => Promise<{
    success: boolean;
    csvPath?: string;
    fileName?: string;
    error?: string;
  }>;

  // 認証情報のクリア
  clearCredentials: () => Promise<{ success: boolean; error?: string }>;

  // Google Drive認証の初期化
  initGoogleAuth: (credentials: { clientId?: string; clientSecret?: string }) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;

  // トークンの設定
  setTokens: (tokens: any) => Promise<{ success: boolean; error?: string }>;

  // Google Driveへのアップロード
  uploadToDrive: (params: { filePath: string; fileName?: string }) => Promise<{
    success: boolean;
    fileId?: string;
    action?: string;
    fileInfo?: any;
    folderInfo?: any;
    error?: string;
  }>;

  // 認証成功イベントのリスナー
  onAuthSuccess: (callback: (data: { tokens: any }) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  getBuildConfig: () => ipcRenderer.invoke('get-build-config'),
  selectFile: () => ipcRenderer.invoke('select-tsv-file'),
  saveTsvPath: (tsvPath) => ipcRenderer.invoke('save-tsv-path', tsvPath),
  getTsvPath: () => ipcRenderer.invoke('get-tsv-path'),
  convertTsvToCsv: (tsvPath, outputFileName) => ipcRenderer.invoke('convert-tsv-to-csv', tsvPath, outputFileName),
  clearCredentials: () => ipcRenderer.invoke('clear-credentials'),
  initGoogleAuth: (credentials) => ipcRenderer.invoke('init-google-auth', credentials),
  setTokens: (tokens) => ipcRenderer.invoke('set-tokens', tokens),
  uploadToDrive: (params) => ipcRenderer.invoke('upload-to-drive', params),
  onAuthSuccess: (callback) => {
    const subscription = (_event: IpcRendererEvent, data: { tokens: any }) => callback(data);
    ipcRenderer.on('auth-success', subscription);
    return () => {
      ipcRenderer.removeListener('auth-success', subscription);
    };
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 後方互換性のため既存のIPCハンドラも保持
const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler

