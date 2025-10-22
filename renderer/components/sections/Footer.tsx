import React from 'react'

export function Footer() {
  const [appVersion, setAppVersion] = React.useState<string>('')

  React.useEffect(() => {
    // アプリのバージョンを取得
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getAppVersion().then((version: string) => {
        setAppVersion(version)
      }).catch(() => {
        // バージョン取得失敗時は表示しない
      })
    }
  }, [])

  const handleCheckForUpdates = () => {
    if (window.electronAPI) {
      window.electronAPI.checkForUpdates().catch((error) => {
        // エラーをコンソールに出力してデバッグを容易に
        // eslint-disable-next-line no-console
        console.error('アップデート確認中にエラーが発生しました:', error)
      })
    }
  }

  return (
    <footer className="mt-12 animate-fade-in">
      <div className="bg-white rounded-xl border border-gray-200 shadow-soft p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 左側: アプリ情報 */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              設定は electron-store で安全に保存されます
            </p>
            {appVersion && (
              <p className="text-xs text-gray-400 mt-1">
                Version {appVersion}
              </p>
            )}
          </div>

          {/* 右側: アップデート確認ボタン */}
          <button
            onClick={handleCheckForUpdates}
            className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200 border border-blue-200 hover:border-blue-300"
          >
            アップデートを確認
          </button>
        </div>
      </div>
    </footer>
  )
}