import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import {
  Settings,
  Upload,
  FolderOpen,
  Shield,
  CheckCircle2,
  AlertCircle,
  FileText,
  Cloud,
  Loader2,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react'
import { Button, Card, StatusIndicator, Tabs, Progress } from '../components'

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
        const tsvPathResult = await window.electronAPI.getTsvPath()
        if (tsvPathResult.success && tsvPathResult.tsvPath) {
          setTsvPath(tsvPathResult.tsvPath)
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
        if (tsvPathResult.success && tsvPathResult.tsvPath && result.success) {
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
        // electron-storeに保存
        const saveResult = await window.electronAPI.saveTsvPath(filePath)
        if (saveResult.success) {
          setStatus({ message: 'TSVファイルパスを設定しました', type: 'success' })
        } else {
          setStatus({ message: `設定の保存に失敗しました: ${saveResult.error}`, type: 'error' })
        }
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
          message: '環境変数の設定が不完全です。.envファイルを確認してください',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* ヘッダー */}
          <header className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4 shadow-medium">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 text-balance">
              Reflux Converter
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-pretty">
              TSVファイルをCSVに変換してGoogle Driveに自動アップロード
            </p>
          </header>

          {/* セットアップ状況概要 */}
          <div className="mb-8 animate-slide-up">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {tsvPath ? (
                      <CheckCircle2 className="w-5 h-5 text-success-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${tsvPath ? 'text-success-700' : 'text-gray-500'}`}>
                      TSVファイル設定
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isAuthenticated ? (
                      <CheckCircle2 className="w-5 h-5 text-success-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${isAuthenticated ? 'text-success-700' : 'text-gray-500'}`}>
                      Google Drive認証
                    </span>
                  </div>
                </div>
                {isSetupComplete && (
                  <div className="flex items-center space-x-2 text-success-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">準備完了</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* タブナビゲーション */}
          <div className="mb-8 animate-slide-down">
            <Tabs
              tabs={[
                {
                  id: 'settings',
                  label: '設定',
                  icon: <Settings className="w-4 h-4" />
                },
                {
                  id: 'upload',
                  label: 'アップロード',
                  icon: <Upload className="w-4 h-4" />
                }
              ]}
              activeTab={activeTab}
              onTabChange={(tab) => {
                if (tab === 'upload' && !isSetupComplete) return
                setActiveTab(tab as 'settings' | 'upload')
              }}
              className="bg-white rounded-xl shadow-soft p-1"
            />
          </div>

          <main className="animate-scale-in">
            {/* 設定画面 */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TSVファイルパス設定 */}
                <Card
                  title="TSVファイルパス設定"
                  subtitle="定期的にアップロードするTSVファイルを選択"
                  className="card-hover"
                  shadow="medium"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={tsvPath}
                        placeholder="TSVファイルを選択してください"
                        readOnly
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700"
                      />
                    </div>

                    <Button
                      onClick={handleBrowseTsv}
                      variant="secondary"
                      icon={FolderOpen}
                      className="w-full"
                    >
                      ファイルを選択
                    </Button>

                    {tsvPath && (
                      <StatusIndicator
                        type="success"
                        message={`設定完了: ${tsvPath.split(/[\\/]/).pop()}`}
                        size="sm"
                      />
                    )}
                  </div>
                </Card>

                {/* Google Drive認証設定 */}
                <Card
                  title="Google Drive認証"
                  subtitle="ファイルアップロードに必要な認証を設定"
                  className="card-hover"
                  shadow="medium"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {isAuthenticated ? '認証済み' : '未認証'}
                      </span>
                      <div className="flex-1"></div>
                      {isAuthenticated ? (
                        <CheckCircle2 className="w-5 h-5 text-success-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-warning-600" />
                      )}
                    </div>

                    {!isAuthenticated ? (
                      <Button
                        onClick={handleAuthenticate}
                        loading={isAuthenticating}
                        variant="primary"
                        icon={Lock}
                        className="w-full"
                      >
                        Google Drive認証
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDisconnect}
                        variant="error"
                        icon={Unlock}
                        className="w-full"
                      >
                        認証を解除
                      </Button>
                    )}

                    {authStatus.message && (
                      <StatusIndicator
                        type={authStatus.type as any}
                        message={authStatus.message}
                        size="sm"
                      />
                    )}
                  </div>
                </Card>

                {/* セットアップガイド */}
                <div className="lg:col-span-2">
                  <Card
                    title="セットアップガイド"
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col items-center text-center p-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${tsvPath ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <span className="font-bold">1</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">ファイル選択</h3>
                        <p className="text-sm text-gray-600">TSVファイルのパスを設定</p>
                      </div>

                      <div className="flex flex-col items-center text-center p-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isAuthenticated ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <span className="font-bold">2</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">認証設定</h3>
                        <p className="text-sm text-gray-600">Google Drive認証を完了</p>
                      </div>

                      <div className="flex flex-col items-center text-center p-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isSetupComplete ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                          <span className="font-bold">3</span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">アップロード</h3>
                        <p className="text-sm text-gray-600">ファイルを変換・アップロード</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* アップロード画面 */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* 現在の設定確認 */}
                <Card
                  title="現在の設定"
                  subtitle="アップロード前に設定内容をご確認ください"
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">TSVファイル</p>
                        <p className="text-sm text-gray-600">{tsvPath.split(/[\\/]/).pop()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <Cloud className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Google Drive</p>
                        <p className="text-sm text-gray-600">認証済み</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-200">
                    <Button
                      onClick={() => setActiveTab('settings')}
                      variant="ghost"
                      icon={Settings}
                      size="sm"
                    >
                      設定を編集
                    </Button>
                  </div>
                </Card>

                {/* アップロード実行 */}
                <Card
                  title="ファイルアップロード"
                  subtitle="TSVファイルをCSVに変換してGoogle Driveにアップロードします"
                  shadow="medium"
                  className="card-hover"
                >
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">処理内容</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• TSVファイルを「inf_score.csv」形式に変換</li>
                            <li>• Google Drive の指定フォルダにアップロード</li>
                            <li>• 既存ファイルがある場合は自動更新</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={!isSetupComplete || isUploading}
                      loading={isUploading}
                      variant="success"
                      icon={Upload}
                      size="lg"
                      className="w-full"
                    >
                      Google Driveにアップロード
                    </Button>
                  </div>
                </Card>

                {/* ステータス表示 */}
                {status.message && (
                  <Card
                    title="実行ステータス"
                    shadow="medium"
                  >
                    <StatusIndicator
                      type={status.type as any}
                      message={status.message}
                      size="md"
                    />

                    {isUploading && (
                      <div className="mt-4">
                        <Progress
                          value={50}
                          color="primary"
                          showPercentage={false}
                          className="mb-2"
                        />
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>処理中...</span>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            )}
          </main>

          {/* フッター */}
          <footer className="text-center mt-12 text-gray-500 text-sm animate-fade-in">
            <p>設定は electron-store で安全に保存されます</p>
          </footer>
        </div>
      </div>
    </React.Fragment>
  )
}
