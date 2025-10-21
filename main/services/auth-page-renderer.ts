import fs from 'fs';
import path from 'path';
import { app } from 'electron';

/**
 * 認証結果ページのHTMLを生成
 * @param type - 'success', 'error', 'cancelled'
 * @returns HTML文字列
 */
export function getAuthPageHTML(type: 'success' | 'error' | 'cancelled'): string {
  console.log('=== getAuthPageHTML called ===');
  console.log('Type:', type);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('__dirname:', __dirname);

  try {
    // 開発時とビルド時の両方でファイルパスを正しく解決
    let templatePath: string;

    // ビルド時は resources/services にファイルがある
    if (app.isPackaged) {
      templatePath = path.join(process.resourcesPath!, 'services', 'auth-page-modern.html');
    } else {
      // 開発時は main/services にファイルがある（コンパイル後は app ディレクトリから見て ../main/services）
      const projectRoot = path.resolve(__dirname, '..');
      templatePath = path.join(projectRoot, 'main', 'services', 'auth-page-modern.html');
    }

    console.log('First template path:', templatePath);
    console.log('File exists:', fs.existsSync(templatePath));

    // ファイルが存在しない場合は元のファイルを試す
    if (!fs.existsSync(templatePath)) {
      console.log('Modern template not found, trying fallback');
      if (app.isPackaged) {
        templatePath = path.join(process.resourcesPath!, 'services', 'auth-page.html');
      } else {
        const projectRoot = path.resolve(__dirname, '..');
        templatePath = path.join(projectRoot, 'main', 'services', 'auth-page.html');
      }
      console.log('Fallback template path:', templatePath);
      console.log('Fallback file exists:', fs.existsSync(templatePath));
    }

    let template = fs.readFileSync(templatePath, 'utf-8');
    console.log('Auth page template loaded from:', templatePath);
    console.log('Template length:', template.length);
    console.log('Template preview:', template.substring(0, 200) + '...');

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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      isPackaged: app.isPackaged,
      dirname: __dirname
    });
    // フォールバック用の簡易HTML
    return `<!DOCTYPE html>
<html><head><title>認証結果</title><style>
body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center; }
.container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
h1 { color: #1a202c; margin-bottom: 20px; }
button { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px; }
</style></head>
<body><div class="container"><h1>認証が${type === 'success' ? '成功' : type === 'error' ? 'エラー' : 'キャンセル'}しました</h1>
<p>このウィンドウを閉じてアプリケーションに戻ってください。</p>
<button onclick="window.close()">ウィンドウを閉じる</button></div>
<script>setTimeout(() => window.close(), 5000);</script></body>
</html>`;
  }
}