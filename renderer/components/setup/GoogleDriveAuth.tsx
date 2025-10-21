import { Shield, CheckCircle2, AlertCircle, Lock, Unlock } from 'lucide-react'
import React from 'react'

import Button from '../Button'
import Card from '../Card'
import StatusIndicator from '../StatusIndicator'

interface GoogleDriveAuthProps {
  isAuthenticated: boolean
  authStatus: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }
  isAuthenticating: boolean
  onAuthenticate: () => void
  onDisconnect: () => void
}

export function GoogleDriveAuth({
  isAuthenticated,
  authStatus,
  isAuthenticating,
  onAuthenticate,
  onDisconnect
}: GoogleDriveAuthProps) {
  return (
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
            onClick={onAuthenticate}
            loading={isAuthenticating}
            variant="primary"
            icon={Lock}
            className="w-full"
          >
            Google Drive認証
          </Button>
        ) : (
          <Button
            onClick={onDisconnect}
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
  )
}