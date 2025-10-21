import type { IpcHandler } from '../main/preload'
import type { ElectronAPI } from '../main/preload'

declare global {
  interface Window {
    ipc: IpcHandler
    electronAPI: ElectronAPI
  }
}
