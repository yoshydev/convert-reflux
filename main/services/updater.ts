import { BrowserWindow, dialog } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

// ログの型定義
interface LoggerWithTransports {
  transports: {
    file: {
      level: string
    }
  }
}

// ロガーが期待する構造を持っているかチェックする型ガード
function isLoggerWithTransports(logger: unknown): logger is LoggerWithTransports {
  return (
    typeof logger === 'object' &&
    logger !== null &&
    'transports' in logger &&
    typeof (logger as { transports: unknown }).transports === 'object' &&
    (logger as { transports: unknown }).transports !== null &&
    'file' in (logger as { transports: { file: unknown } }).transports &&
    typeof (logger as { transports: { file: unknown } }).transports.file === 'object' &&
    (logger as { transports: { file: unknown } }).transports.file !== null &&
    'level' in (logger as { transports: { file: { level: unknown } } }).transports.file
  )
}

// ログ設定
autoUpdater.logger = log
if (isLoggerWithTransports(autoUpdater.logger)) {
  autoUpdater.logger.transports.file.level = 'info'
}

// 開発環境ではアップデートをチェックしない
const isDev = process.env.NODE_ENV !== 'production'

// 起動時にアップデートチェックを開始するまでの遅延時間（ミリ秒）
const INITIAL_UPDATE_CHECK_DELAY_MS = 3000

let mainWindow: BrowserWindow | null = null

/**
 * 自動アップデート機能を初期化
 */
export function initAutoUpdater(window: BrowserWindow): void {
  mainWindow = window

  if (isDev) {
    log.info('開発環境のため、自動アップデートは無効です')
    return
  }

  // アップデートの自動ダウンロードを有効化
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // アップデートチェック開始時
  autoUpdater.on('checking-for-update', () => {
    log.info('アップデートを確認中...')
    sendStatusToWindow('checking-for-update')
  })

  // アップデートが利用可能
  autoUpdater.on('update-available', (info) => {
    log.info('アップデートが利用可能:', info)
    sendStatusToWindow('update-available', info)

    // ユーザーに確認
    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          title: 'アップデート利用可能',
          message: `新しいバージョン ${info.version} が利用可能です。`,
          detail: 'アップデートをダウンロードしますか?',
          buttons: ['ダウンロード', 'キャンセル'],
          defaultId: 0,
          cancelId: 1,
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.downloadUpdate()
          }
        })
        .catch((err) => {
          log.error('ダイアログエラー:', err)
        })
    }
  })

  // アップデートが利用不可
  autoUpdater.on('update-not-available', (info) => {
    log.info('アップデートなし:', info)
    sendStatusToWindow('update-not-available', info)
  })

  // エラー発生時
  autoUpdater.on('error', (err) => {
    log.error('アップデートエラー:', err)
    sendStatusToWindow('error', { message: err.message })

    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog
        .showMessageBox(mainWindow, {
          type: 'error',
          title: 'アップデートエラー',
          message: 'アップデートの確認中にエラーが発生しました',
          detail: err.message,
          buttons: ['OK'],
        })
        .catch((dialogErr) => {
          log.error('ダイアログエラー:', dialogErr)
        })
    }
  })

  // ダウンロード進行状況
  autoUpdater.on('download-progress', (progressObj) => {
    const logMessage = `ダウンロード速度: ${progressObj.bytesPerSecond} - ダウンロード済み ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    log.info(logMessage)
    sendStatusToWindow('download-progress', progressObj)
  })

  // ダウンロード完了
  autoUpdater.on('update-downloaded', (info) => {
    log.info('アップデートがダウンロードされました:', info)
    sendStatusToWindow('update-downloaded', info)

    if (mainWindow && !mainWindow.isDestroyed()) {
      dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          title: 'アップデート準備完了',
          message: 'アップデートがダウンロードされました',
          detail: 'アプリを再起動してインストールしますか?',
          buttons: ['再起動', '後で'],
          defaultId: 0,
          cancelId: 1,
        })
        .then((result) => {
          if (result.response === 0) {
            // アプリを終了してアップデートをインストール
            autoUpdater.quitAndInstall()
          }
        })
        .catch((err) => {
          log.error('ダイアログエラー:', err)
        })
    }
  })

  // 起動時にアップデートをチェック
  setTimeout(() => {
    checkForUpdates()
  }, INITIAL_UPDATE_CHECK_DELAY_MS)
}

/**
 * 手動でアップデートをチェック
 */
export function checkForUpdates(): void {
  if (isDev) {
    log.info('開発環境のため、アップデートチェックをスキップします')
    return
  }

  autoUpdater.checkForUpdates().catch((err) => {
    log.error('アップデートチェックエラー:', err)
  })
}

/**
 * レンダラープロセスにステータスを送信
 */
function sendStatusToWindow(event: string, data?: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater-status', { event, data })
  }
}
