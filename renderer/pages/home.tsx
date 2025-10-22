import { Settings, Upload } from 'lucide-react'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'

import { Tabs, UpdateNotification } from '../components'
import { Header, SetupStatus, UploadTab, Footer } from '../components/sections'
import { SettingsTab } from '../components/setup'
import { useAuth, useTsvFile, useUpload } from '../hooks'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'upload'>('settings')

  // カスタムフックを使用
  const { isAuthenticated, authStatus, isAuthenticating, authenticate, disconnect } = useAuth()
  const { tsvPath, status, setStatus, selectTsvFile } = useTsvFile()
  const { isUploading, uploadToGoogleDrive } = useUpload({
    tsvPath,
    isAuthenticated,
    setStatus
  })

  // セットアップが完了しているかチェック
  const isSetupComplete = tsvPath && isAuthenticated

  // 初期化時にセットアップ完了していればアップロードタブに切り替え
  useEffect(() => {
    if (tsvPath && isAuthenticated) {
      setActiveTab('upload')
      setStatus({ message: 'ファイルをアップロードできます', type: 'success' })
    }
  }, [tsvPath, isAuthenticated, setStatus])

  return (
    <React.Fragment>
      <Head>
        <title>Reflux Converter</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Header />

          <SetupStatus
            tsvPath={tsvPath}
            isAuthenticated={isAuthenticated}
          />

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
              <SettingsTab
                tsvPath={tsvPath}
                isAuthenticated={isAuthenticated}
                authStatus={authStatus}
                isAuthenticating={isAuthenticating}
                onSelectTsvFile={selectTsvFile}
                onAuthenticate={authenticate}
                onDisconnect={disconnect}
              />
            )}

            {/* アップロード画面 */}
            {activeTab === 'upload' && (
              <UploadTab
                tsvPath={tsvPath}
                isAuthenticated={isAuthenticated}
                status={status}
                isUploading={isUploading}
                onSwitchToSettings={() => setActiveTab('settings')}
                onUpload={uploadToGoogleDrive}
              />
            )}
          </main>

          {/* アップデート通知 */}
          <div className="mt-6">
            <UpdateNotification />
          </div>

          <Footer />
        </div>
      </div>
    </React.Fragment>
  )
}
