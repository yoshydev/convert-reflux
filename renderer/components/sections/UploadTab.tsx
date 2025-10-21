import {
  Settings,
  FileText,
  Cloud,
  Upload,
  ExternalLink,
  Loader2
} from 'lucide-react'
import React from 'react'

import Button from '../Button'
import Card from '../Card'
import Progress from '../Progress'
import StatusIndicator from '../StatusIndicator'

interface UploadTabProps {
  tsvPath: string
  isAuthenticated: boolean
  status: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }
  isUploading: boolean
  onSwitchToSettings: () => void
  onUpload: () => void
}

export function UploadTab({
  tsvPath,
  isAuthenticated,
  status,
  isUploading,
  onSwitchToSettings,
  onUpload
}: UploadTabProps) {
  const isSetupComplete = tsvPath && isAuthenticated

  return (
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
            onClick={onSwitchToSettings}
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
            onClick={onUpload}
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
            type={status.type}
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
  )
}