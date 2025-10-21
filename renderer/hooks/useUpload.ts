import { useState } from 'react'

interface Status {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface UploadHookProps {
  tsvPath: string
  isAuthenticated: boolean
  setStatus: (status: Status) => void
}

export function useUpload({ tsvPath, isAuthenticated, setStatus }: UploadHookProps) {
  const [isUploading, setIsUploading] = useState(false)

  const uploadToGoogleDrive = async () => {
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

      // csvPathが存在しない場合はエラー
      if (!convertResult.csvPath) {
        setStatus({
          message: 'エラー: 変換されたCSVファイルのパスが取得できませんでした',
          type: 'error'
        })
        setIsUploading(false)
        return
      }

      // 保存されたトークンを設定
      await window.electronAPI.setTokens(null)

      const result = await window.electronAPI.uploadToDrive({
        filePath: convertResult.csvPath,
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

  return {
    isUploading,
    uploadToGoogleDrive
  }
}