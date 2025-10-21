import path from 'path'
import { app, ipcMain, Menu } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { registerIpcHandlers } from './handlers'
import * as auth from './services/auth'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // IPCハンドラーを登録
  registerIpcHandlers(mainWindow)

  if (isProd) {
    await mainWindow.loadURL('app://./home')
    // 本番環境ではメニューを削除
    Menu.setApplicationMenu(null)
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

app.on('before-quit', () => {
  // OAuth2クライアントをクリア
  auth.clearOAuth2Client()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})

