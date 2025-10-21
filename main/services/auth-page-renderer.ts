import fs from 'fs';
import path from 'path';

/**
 * 認証結果ページのHTMLを生成
 * @param type - 'success', 'error', 'cancelled'
 * @returns HTML文字列
 */
export function getAuthPageHTML(type: 'success' | 'error' | 'cancelled'): string {
  try {
    const templatePath = path.join(__dirname, 'auth-page.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    let title: string;
    let message: string;
    let instruction: string;
    let icon: string;
    let iconClass: string;

    switch (type) {
      case 'success':
        title = '認証成功';
        message = 'Google Drive認証が正常に完了しました。';
        instruction = 'アプリケーションに戻って作業を続けてください。';
        icon = '✓';
        iconClass = 'success';
        break;
      case 'error':
        title = '認証エラー';
        message = '認証プロセス中にエラーが発生しました。';
        instruction = 'アプリケーションに戻って再度お試しください。';
        icon = '✗';
        iconClass = 'error';
        break;
      case 'cancelled':
        title = '認証キャンセル';
        message = '認証がユーザーによってキャンセルされました。';
        instruction = 'アプリケーションに戻って必要に応じて再度お試しください。';
        icon = '⚠';
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