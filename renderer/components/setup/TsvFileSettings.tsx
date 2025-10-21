import { FolderOpen } from 'lucide-react'
import React from 'react'

import Button from '../Button'
import Card from '../Card'
import StatusIndicator from '../StatusIndicator'

interface TsvFileSettingsProps {
  tsvPath: string
  onSelectFile: () => void
}

export function TsvFileSettings({ tsvPath, onSelectFile }: TsvFileSettingsProps) {
  return (
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
          onClick={onSelectFile}
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
  )
}