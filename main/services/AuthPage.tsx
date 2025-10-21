import React from 'react';

interface AuthPageProps {
    type: 'success' | 'error' | 'cancelled';
}

const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const contents = {
    success: {
      icon: '✓',
      iconClass: 'success',
      title: '認証が完了しました！',
      message: 'Google Driveへの接続に成功しました。',
      instruction: 'このウィンドウを閉じて、アプリに戻ってファイルのアップロードを開始できます。'
    },
    error: {
      icon: '✕',
      iconClass: 'error',
      title: '認証に失敗しました',
      message: '認証処理中にエラーが発生しました。',
      instruction: 'このウィンドウを閉じて、アプリから再度認証をお試しください。問題が解決しない場合は、設定をご確認ください。'
    },
    cancelled: {
      icon: '!',
      iconClass: 'cancelled',
      title: '認証がキャンセルされました',
      message: '認証プロセスが中断されました。',
      instruction: 'このウィンドウを閉じて、もう一度認証を行う場合はアプリから操作してください。'
    }
  };

  const content = contents[type] || contents.error;

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      animation: scaleIn 0.5s ease-out 0.2s both;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    .icon.success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .icon.error {
      background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
    }

    .icon.cancelled {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1a202c;
    }

    p {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 8px;
    }

    .instruction {
      margin-top: 24px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      font-size: 14px;
      color: #718096;
    }

    .close-btn {
      margin-top: 32px;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .close-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .close-btn:active {
      transform: translateY(0);
    }

    .auto-close-info {
      margin-top: 16px;
      font-size: 13px;
      color: #a0aec0;
    }
  `;

  const script = `
    // ウィンドウを閉じる処理
    function closeWindow() {
      // 複数の方法を試す
      if (window.opener) {
        window.close();
      } else {
        // window.close()が動作しない場合の代替手段
        try {
          window.open('', '_self').close();
        } catch (e) {
          // 最後の手段として、ユーザーに手動で閉じてもらう
          alert('このウィンドウを手動で閉じてください（Ctrl+W または Alt+F4）');
        }
      }
    }

    // ボタンクリックイベント
    document.getElementById('closeBtn').addEventListener('click', closeWindow);

    // 5秒後に自動的に閉じる
    setTimeout(() => {
      closeWindow();
    }, 5000);

    // カウントダウン表示（オプション）
    let countdown = 5;
    const autoCloseInfo = document.querySelector('.auto-close-info');
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        autoCloseInfo.textContent = \`このウィンドウは\${countdown}秒後に自動的に閉じます\`;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);
  `;

  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{content.title}</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div className="container">
          <div className={`icon ${content.iconClass}`}>{content.icon}</div>
          <h1>{content.title}</h1>
          <p>{content.message}</p>
          <div className="instruction">{content.instruction}</div>
          <button className="close-btn" id="closeBtn">ウィンドウを閉じる</button>
          <div className="auto-close-info">このウィンドウは5秒後に自動的に閉じます</div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  );
};

export default AuthPage;