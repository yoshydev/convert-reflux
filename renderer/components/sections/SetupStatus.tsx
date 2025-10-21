import React from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import Card from '../Card'

interface SetupStatusProps {
  tsvPath: string
  isAuthenticated: boolean
}

export function SetupStatus({ tsvPath, isAuthenticated }: SetupStatusProps) {
  const isSetupComplete = tsvPath && isAuthenticated

  return (
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
  )
}