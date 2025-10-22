import React, { useEffect, useState } from 'react'

interface UpdateInfo {
  version?: string
  releaseNotes?: string
}

interface ProgressInfo {
  bytesPerSecond: number
  percent: number
  transferred: number
  total: number
}

// 通知を自動的に非表示にするまでの時間（ミリ秒）
const AUTO_HIDE_NOTIFICATION_DELAY_MS = 3000

export const UpdateNotification: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<ProgressInfo | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      return
    }

    let autoHideTimeoutId: NodeJS.Timeout | null = null

    const unsubscribe = window.electronAPI.onUpdaterStatus((data) => {
      const { event, data: eventData } = data

      // 既存のタイムアウトをクリア
      if (autoHideTimeoutId !== null) {
        clearTimeout(autoHideTimeoutId)
        autoHideTimeoutId = null
      }

      setUpdateStatus(event)

      switch (event) {
        case 'update-available':
          setUpdateInfo(eventData as UpdateInfo)
          break
        case 'download-progress':
          setDownloadProgress(eventData as ProgressInfo)
          break
        case 'update-downloaded':
          setDownloadProgress(null)
          break
        case 'update-not-available':
        case 'error':
          autoHideTimeoutId = setTimeout(() => {
            setUpdateStatus(null)
            setUpdateInfo(null)
          }, AUTO_HIDE_NOTIFICATION_DELAY_MS)
          break
      }
    })

    return () => {
      unsubscribe()
      // コンポーネントのアンマウント時にタイムアウトをクリーンアップ
      if (autoHideTimeoutId !== null) {
        clearTimeout(autoHideTimeoutId)
      }
    }
  }, [])

  const handleCheckForUpdates = () => {
    if (window.electronAPI) {
      window.electronAPI.checkForUpdates().catch(() => {
        // エラーはメインプロセスで処理される
      })
    }
  }

  if (!updateStatus) {
    return (
      <div className="text-center">
        <button
          onClick={handleCheckForUpdates}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          アップデートを確認
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
      {updateStatus === 'checking-for-update' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-blue-800">アップデートを確認中...</p>
        </div>
      )}

      {updateStatus === 'update-available' && updateInfo && (
        <div>
          <p className="text-sm font-semibold text-blue-900">
            新しいバージョン {updateInfo.version} が利用可能です
          </p>
          <p className="text-xs text-blue-700 mt-1">
            ダウンロードしますか？確認ダイアログが表示されます。
          </p>
        </div>
      )}

      {updateStatus === 'download-progress' && downloadProgress && (
        <div>
          <p className="text-sm font-semibold text-blue-900">
            アップデートをダウンロード中...
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-blue-700 mb-1">
              <span>{downloadProgress.percent.toFixed(1)}%</span>
              <span>
                {(downloadProgress.transferred / 1024 / 1024).toFixed(2)} MB /{' '}
                {(downloadProgress.total / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {updateStatus === 'update-downloaded' && (
        <div>
          <p className="text-sm font-semibold text-green-900">
            アップデートの準備ができました
          </p>
          <p className="text-xs text-green-700 mt-1">
            再起動してインストールしますか？確認ダイアログが表示されます。
          </p>
        </div>
      )}

      {updateStatus === 'update-not-available' && (
        <div>
          <p className="text-sm text-gray-700">最新バージョンです</p>
        </div>
      )}

      {updateStatus === 'error' && (
        <div>
          <p className="text-sm font-semibold text-red-900">
            アップデートの確認に失敗しました
          </p>
          <button
            onClick={handleCheckForUpdates}
            className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
          >
            再試行
          </button>
        </div>
      )}
    </div>
  )
}
