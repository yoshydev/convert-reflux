import fs from 'fs';
import path from 'path';

/**
 * 認証結果ページのHTMLを生成
 * @param type - 'success', 'error', 'cancelled'
 * @returns HTML文字列
 */
export function getAuthPageHTML(type: 'success' | 'error' | 'cancelled'): string {
  try {
    const templatePath = path.join(__dirname, 'auth-page-modern.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    let title: string;
    let message: string;
    let instruction: string;
    let icon: string;
    let iconClass: string;

    switch (type) {
      case 'success':
        title = '認証が完了しました！';
        message = 'Google Driveへの接続に成功しました。';
        instruction = 'このウィンドウを閉じて、アプリに戻ってファイルのアップロードを開始できます。';
        icon = '✓';
        iconClass = 'success';
        break;
      case 'error':
        title = '認証に失敗しました';
        message = '認証処理中にエラーが発生しました。';
        instruction = 'このウィンドウを閉じて、アプリから再度認証をお試しください。問題が解決しない場合は、設定をご確認ください。';
        icon = '✕';
        iconClass = 'error';
        break;
      case 'cancelled':
        title = '認証がキャンセルされました';
        message = '認証プロセスが中断されました。';
        instruction = 'このウィンドウを閉じて、もう一度認証を行う場合はアプリから操作してください。';
        icon = '!';
        iconClass = 'cancelled';
        break;
      default:
        throw new Error(`Unknown auth page type: ${type}`);
    }

    // テンプレートの置換
    template = template
      .replace(/{{TITLE}}/g, title)
      .replace(/{{MESSAGE}}/g, message)
      .replace(/{{INSTRUCTION}}/g, instruction)
      .replace(/{{ICON}}/g, icon)
      .replace(/{{ICON_CLASS}}/g, iconClass);

    return template;
  } catch (error) {
    console.error('Error generating auth page HTML:', error);
    // フォールバック用の簡易HTML
    return `<!DOCTYPE html>
<html><head><title>認証結果</title></head>
<body><h1>認証が${type === 'success' ? '成功' : type === 'error' ? 'エラー' : 'キャンセル'}しました</h1></body>
</html>`;
  }
}