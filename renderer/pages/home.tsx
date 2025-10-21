import Head from 'next/head'
import React, { useEffect, useState } from 'react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'upload'>('settings')
  const [tsvPath, setTsvPath] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [status, setStatus] = useState({ message: '準備完了', type: 'info' })
  const [authStatus, setAuthStatus] = useState({ message: '', type: 'info' })
  const [isUploading, setIsUploading] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // セットアップが完了しているかチェック
  const isSetupComplete = tsvPath && isAuthenticated

  // 初期化
  useEffect(() => {
    const initialize = async () => {
      try {
        // 保存されたTSVパスを読み込み
        const savedPath = localStorage.getItem('configuredTsvPath')
        if (savedPath) {
          setTsvPath(savedPath)
        }

        // ビルド時の設定を確認
        const buildConfig = await window.electronAPI.getBuildConfig()
        if (buildConfig.hasClientId && buildConfig.hasClientSecret) {
          setAuthStatus({
            message: '「Google Drive 認証」ボタンをクリックしてください。',
            type: 'warning'
          })
        }

        // 保存されたトークンで認証を試みる
        const result = await window.electronAPI.setTokens(null)
        if (result.success) {
          setIsAuthenticated(true)
          setAuthStatus({
            message: '認証済み（保存されたトークンを使用）',
            type: 'success'
          })
        }

        // セットアップ完了していればアップロードタブに切り替え
        if (savedPath && result.success) {
          setActiveTab('upload')
          setStatus({ message: 'ファイルをアップロードできます', type: 'success' })
        }
      } catch (error) {
        console.error('初期化エラー:', error)
      }
    }

    initialize()

    // 認証成功イベントのリスナーを設定
    const unsubscribe = window.electronAPI.onAuthSuccess((data) => {
      console.log('認証成功:', data)
      setIsAuthenticated(true)
      setAuthStatus({
        message: '✓ 認証成功! Google Driveにアップロードできます。',
        type: 'success'
      })
      setIsAuthenticating(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // TSVファイル選択
  const handleBrowseTsv = async () => {
    try {
      const filePath = await window.electronAPI.selectFile()
      if (filePath) {
        setTsvPath(filePath)
        localStorage.setItem('configuredTsvPath', filePath)
        setStatus({ message: 'TSVファイルパスを設定しました', type: 'success' })
      }
    } catch (error) {
      console.error('ファイル選択エラー:', error)
      setStatus({ message: `ファイル選択に失敗しました: ${error}`, type: 'error' })
    }
  }

  // Google Drive認証
  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true)
      setAuthStatus({ message: 'ブラウザを起動して認証中...', type: 'info' })

      const buildConfig = await window.electronAPI.getBuildConfig()
      if (!buildConfig.hasClientId || !buildConfig.hasClientSecret) {
        setAuthStatus({
          message: 'ビルド設定が不完全です。build-config.jsを確認してください',
          type: 'error'
        })
        setIsAuthenticating(false)
        return
      }

      setAuthStatus({
        message: 'ブラウザが開きます。Googleアカウントで認証してください...',
        type: 'info'
      })

      const result = await window.electronAPI.initGoogleAuth({})

      if (result.success) {
        setIsAuthenticated(true)
        setAuthStatus({
          message: '✓ 認証成功! Google Driveにアップロードできます。',
          type: 'success'
        })
      } else {
        setAuthStatus({ message: `認証エラー: ${result.error}`, type: 'error' })
      }
      setIsAuthenticating(false)
    } catch (error) {
      setAuthStatus({ message: `エラー: ${error}`, type: 'error' })
      setIsAuthenticating(false)
    }
  }

  // 連携解除
  const handleDisconnect = async () => {
    if (!confirm('Google Driveとの連携を解除しますか？\n保存されている認証情報とトークンがすべて削除されます。')) {
      return
    }

    try {
      setAuthStatus({ message: '連携を解除中...', type: 'info' })
      const result = await window.electronAPI.clearCredentials()

      if (result.success) {
        setIsAuthenticated(false)
        setAuthStatus({ message: '連携を解除しました', type: 'warning' })
      } else {
        setAuthStatus({ message: `エラー: ${result.error}`, type: 'error' })
      }
    } catch (error) {
      setAuthStatus({ message: `エラー: ${error}`, type: 'error' })
    }
  }

  // Google Driveアップロード
  const handleUpload = async () => {
    if (!tsvPath) {
      setStatus({ message: '先にTSVファイルパスを設定してください', type: 'warning' })
      return
    }

    if (!isAuthenticated) {
      setStatus({ message: '先にGoogle Drive認証を完了してください', type: 'warning' })
      return
    }

    try {
      setIsUploading(true)

      // 変換処理を実行
      setStatus({ message: 'TSVをCSVに変換中...', type: 'info' })
      const convertResult = await window.electronAPI.convertTsvToCsv(tsvPath, 'inf_score.csv')

      if (!convertResult.success) {
        setStatus({ message: `変換エラー: ${convertResult.error}`, type: 'error' })
        setIsUploading(false)
        return
      }

      setStatus({
        message: `✓ CSV変換完了: ${convertResult.fileName}\nGoogle Driveにアップロード中...`,
        type: 'info'
      })

      // 保存されたトークンを設定
      await window.electronAPI.setTokens(null)

      const result = await window.electronAPI.uploadToDrive({
        filePath: convertResult.csvPath!,
        fileName: 'inf_score.csv'
      })

      if (result.success) {
        const actionText = result.action === 'updated' ? '更新' : '作成'
        setStatus({
          message: `✓ Google Driveに${actionText}しました!\nフォルダ: ${result.folderInfo.name}\nファイル名: ${result.fileInfo.name}\nファイルID: ${result.fileInfo.id}\n更新日時: ${result.fileInfo.modifiedTime}`,
          type: 'success'
        })
      } else {
        setStatus({ message: `アップロードエラー: ${result.error}`, type: 'error' })
      }
      setIsUploading(false)
    } catch (error) {
      setStatus({ message: `エラー: ${error}`, type: 'error' })
      setIsUploading(false)
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>Reflux Converter</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Reflux Converter</h1>
            <p className="text-gray-600">TSVファイルをCSVに変換してGoogle Driveにアップロード</p>
          </header>

          {/* タブナビゲーション */}
          <nav className="flex mb-6 bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'settings'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚙️ 設定
            </button>
            <button
              onClick={() => isSetupComplete && setActiveTab('upload')}
              disabled={!isSetupComplete}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${activeTab === 'upload'
                ? 'bg-indigo-600 text-white'
                : isSetupComplete
                  ? 'bg-white text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ☁️ アップロード
            </button>
          </nav>

          <main>
            {/* 設定画面 */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* セットアップ状況 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 セットアップ状況</h2>
                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center ${tsvPath ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">{tsvPath ? '✓' : '○'}</span>
                      <span>TSVファイルのパス設定</span>
                    </div>
                    <div className={`flex items-center ${isAuthenticated ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-2">{isAuthenticated ? '✓' : '○'}</span>
                      <span>Google Drive 認証</span>
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded ${isSetupComplete
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {isSetupComplete
                      ? '✓ セットアップ完了！アップロードタブに移動できます'
                      : '設定を完了してアップロード機能を有効にしてください'}
                  </div>
                </div>

                {/* TSVファイルパス設定 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">📁 TSVファイルパス設定</h2>
                  <p className="text-gray-600 mb-4">定期的にアップロードするTSVファイルのパスを設定してください</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tsvPath}
                      placeholder="例: C:\Users\user\Documents\Reflux.x.xx.xx\tracker.tsv"
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <button
                      onClick={handleBrowseTsv}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      📂 参照
                    </button>
                  </div>
                  <small className="text-gray-500">設定したファイルは自動的に読み込まれます</small>
                  {tsvPath && (
                    <div className="mt-2 p-3 bg-green-100 text-green-800 rounded">
                      設定完了: {tsvPath.split(/[\\/]/).pop()}
                    </div>
                  )}
                </div>

                {/* Google Drive認証設定 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🔐 Google Drive 認証</h2>
                  <p className="text-gray-600 mb-4">Google Driveへのアップロードには認証が必要です</p>
                  <div className="flex gap-2 mb-4">
                    {!isAuthenticated ? (
                      <button
                        onClick={handleAuthenticate}
                        disabled={isAuthenticating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        🔐 Google Drive 認証
                      </button>
                    ) : (
                      <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        🔓 連携解除
                      </button>
                    )}
                  </div>
                  {authStatus.message && (
                    <div
                      className={`p-3 rounded ${authStatus.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : authStatus.type === 'error'
                          ? 'bg-red-100 text-red-800'
                          : authStatus.type === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {authStatus.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* アップロード画面 */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* 現在の設定 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 現在の設定</h2>
                  <div className="space-y-2 mb-4">
                    <div>
                      <strong>TSVファイル: </strong>
                      <span className="text-green-600">{tsvPath.split(/[\\/]/).pop()}</span>
                    </div>
                    <div>
                      <strong>Google Drive: </strong>
                      <span className="text-green-600">認証済み ✓</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    ⚙️ 設定を編集
                  </button>
                </div>

                {/* アップロード実行 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">☁️ Google Driveにアップロード</h2>
                  <p className="text-gray-600 mb-4">
                    設定されたTSVファイルを「inf_score.csv」に変換してアップロードします
                  </p>
                  <button
                    onClick={handleUpload}
                    disabled={!isSetupComplete || isUploading}
                    className="w-full py-3 bg-green-600 text-white text-lg font-bold rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    ☁️ Google Driveにアップロード
                  </button>
                </div>

                {/* ステータス表示 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">ステータス</h2>
                  <div
                    className={`p-4 rounded whitespace-pre-wrap ${status.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : status.type === 'error'
                        ? 'bg-red-100 text-red-800'
                        : status.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {status.message}
                  </div>
                </div>
              </div>
            )}
          </main>

          <footer className="text-center mt-8 text-gray-600">
            <p>設定はlocalStorageに保存されます</p>
          </footer>
        </div>
      </div>
    </React.Fragment>
  )
}
