import React from 'react'

import { GoogleDriveAuth } from './GoogleDriveAuth'
import { SetupGuide } from './SetupGuide'
import { TsvFileSettings } from './TsvFileSettings'

interface SettingsTabProps {
  tsvPath: string
  isAuthenticated: boolean
  authStatus: {
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
  }
  isAuthenticating: boolean
  onSelectTsvFile: () => void
  onAuthenticate: () => void
  onDisconnect: () => void
}

export function SettingsTab({
  tsvPath,
  isAuthenticated,
  authStatus,
  isAuthenticating,
  onSelectTsvFile,
  onAuthenticate,
  onDisconnect
}: SettingsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TsvFileSettings
        tsvPath={tsvPath}
        onSelectFile={onSelectTsvFile}
      />

      <GoogleDriveAuth
        isAuthenticated={isAuthenticated}
        authStatus={authStatus}
        isAuthenticating={isAuthenticating}
        onAuthenticate={onAuthenticate}
        onDisconnect={onDisconnect}
      />

      <SetupGuide
        tsvPath={tsvPath}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}