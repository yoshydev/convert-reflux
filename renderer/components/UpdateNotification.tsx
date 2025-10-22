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

type UpdateStatus =
  | 'idle'
  | 'checking-for-update'
  | 'update-available'
  | 'download-progress'
  | 'update-downloaded'
  | 'update-not-available'
  | 'error'

interface UpdateState {
  status: UpdateStatus
  info: UpdateInfo | null
  progress: ProgressInfo | null
}

// 通知を自動的に非表示にするまでの時間（ミリ秒）
const AUTO_HIDE_NOTIFICATION_DELAY_MS = 3000

const initialState: UpdateState = {
  status: 'idle',
  info: null,
  progress: null,
}

export const UpdateNotification: React.FC = () => {
  const [updateState, setUpdateState] = useState<UpdateState>(initialState)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      return
    }

    let autoHideTimeoutId: NodeJS.Timeout | null = null

    const handleUpdaterStatus = (data: { event: string; data?: unknown }) => {
      const { event, data: eventData } = data

      // 既存のタイムアウトをクリア
      if (autoHideTimeoutId !== null) {
        clearTimeout(autoHideTimeoutId)
        autoHideTimeoutId = null
      }

      switch (event) {
        case 'update-available':
          setUpdateState({
            status: 'update-available',
            info: eventData as UpdateInfo,
            progress: null,
          })
          break
        case 'download-progress':
          setUpdateState((prev) => ({
            status: 'download-progress',
            info: prev.info,
            progress: eventData as ProgressInfo,
          }))
          break
        case 'update-downloaded':
          setUpdateState((prev) => ({
            status: 'update-downloaded',
            info: prev.info,
            progress: null,
          }))
          break
        case 'update-not-available':
        case 'error':
          setUpdateState({
            status: event as UpdateStatus,
            info: null,
            progress: null,
          })
          autoHideTimeoutId = setTimeout(() => {
            setUpdateState(initialState)
          }, AUTO_HIDE_NOTIFICATION_DELAY_MS)
          break
        case 'checking-for-update':
          setUpdateState({
            status: 'checking-for-update',
            info: null,
            progress: null,
          })
          break
        default:
          break
      }
    }

    const unsubscribe = window.electronAPI.onUpdaterStatus(handleUpdaterStatus)

    return () => {
      unsubscribe()
      // コンポーネントのアンマウント時にタイムアウトをクリーンアップ
      if (autoHideTimeoutId !== null) {
        clearTimeout(autoHideTimeoutId)
      }
    }
  }, [])

  const { status, info, progress } = updateState

  // idle状態では何も表示しない（アップデート確認ボタンはFooterに移動）
  if (status === 'idle') {
    return null
  }

  return (
    <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
      {status === 'checking-for-update' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-sm text-blue-800">アップデートを確認中...</p>
        </div>
      )}

      {status === 'update-available' && info && (
        <div>
          <p className="text-sm font-semibold text-blue-900">
            新しいバージョン {info.version} が利用可能です
          </p>
          <p className="text-xs text-blue-700 mt-1">
            ダウンロードしますか？確認ダイアログが表示されます。
          </p>
        </div>
      )}

      {status === 'download-progress' && progress && (
        <div>
          <p className="text-sm font-semibold text-blue-900">
            アップデートをダウンロード中...
          </p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-blue-700 mb-1">
              <span>{progress.percent.toFixed(1)}%</span>
              <span>
                {(progress.transferred / 1024 / 1024).toFixed(2)} MB /{' '}
                {(progress.total / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {status === 'update-downloaded' && (
        <div>
          <p className="text-sm font-semibold text-green-900">
            アップデートの準備ができました
          </p>
          <p className="text-xs text-green-700 mt-1">
            再起動してインストールしますか？確認ダイアログが表示されます。
          </p>
        </div>
      )}

      {status === 'update-not-available' && (
        <div>
          <p className="text-sm text-gray-700">最新バージョンです</p>
        </div>
      )}

      {status === 'error' && (
        <div>
          <p className="text-sm font-semibold text-red-900">
            アップデートの確認に失敗しました
          </p>
          <p className="text-xs text-red-700 mt-1">
            フッターのアップデート確認ボタンから再試行してください
          </p>
        </div>
      )}
    </div>
  )
}
