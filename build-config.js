const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔧 config.js を生成中...');

const config = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || ''
};

// 環境変数が設定されているか確認
if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  警告: GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET が .env ファイルに設定されていません');
  console.warn('   .env ファイルを作成し、以下の内容を設定してください:');
  console.warn('   GOOGLE_CLIENT_ID=your_client_id');
  console.warn('   GOOGLE_CLIENT_SECRET=your_client_secret');
  console.warn('   GOOGLE_FOLDER_ID=your_folder_id (オプション)');
  console.warn('   認証情報なしで起動します。アプリ内で入力する必要があります。');
}
  console.warn('   注意: アプリが自動的にGoogle Driveにフォルダを作成します。');

// config.jsを生成
const configContent = `// このファイルは自動生成されます。直接編集しないでください。
// ビルド時に .env ファイルから生成されます。

module.exports = ${JSON.stringify(config, null, 2)};
`;

try {
  fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
  console.log('✅ config.js が生成されました');

  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    console.log('✅ 認証情報が埋め込まれました');
  }
} catch (error) {
  console.error('❌ エラー: config.js の生成に失敗しました', error);
  process.exit(1);
}
