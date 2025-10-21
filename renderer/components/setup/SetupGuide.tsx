import React from 'react'
import Card from '../Card'

interface SetupGuideProps {
  tsvPath: string
  isAuthenticated: boolean
}

export function SetupGuide({ tsvPath, isAuthenticated }: SetupGuideProps) {
  const isSetupComplete = tsvPath && isAuthenticated

  return (
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
  )
}