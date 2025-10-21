import { useState, useEffect } from 'react'

interface Status {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export function useTsvFile() {
  const [tsvPath, setTsvPath] = useState<string>('')
  const [status, setStatus] = useState<Status>({ message: '準備完了', type: 'info' })

  useEffect(() => {
    const initializeTsvPath = async () => {
      try {
        // 保存されたTSVパスを読み込み
        const tsvPathResult = await window.electronAPI.getTsvPath()
        if (tsvPathResult.success && tsvPathResult.tsvPath) {
          setTsvPath(tsvPathResult.tsvPath)
        }
      } catch (error) {
        console.error('TSVパス初期化エラー:', error)
      }
    }

    initializeTsvPath()
  }, [])

  const selectTsvFile = async () => {
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

  return {
    tsvPath,
    status,
    setStatus,
    selectTsvFile
  }
}