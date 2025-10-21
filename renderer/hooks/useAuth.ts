import { useState, useEffect } from 'react'

interface AuthStatus {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ message: '', type: 'info' })
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
      } catch (error) {
        console.error('認証初期化エラー:', error)
      }
    }

    initializeAuth()

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

  const authenticate = async () => {
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

  const disconnect = async () => {
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

  return {
    isAuthenticated,
    authStatus,
    isAuthenticating,
    authenticate,
    disconnect
  }
}