#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// .envファイルから環境変数を読み込む（存在する場合）
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath) && !process.env.GOOGLE_CLIENT_ID) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key]) {
        process.env[key] = value.trim();
      }
    }
  });
}

// 環境変数から認証情報を取得
const clientId = process.env.GOOGLE_CLIENT_ID || '';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

// 設定ファイルを生成（JSON.stringify()で安全にエスケープ）
const configContent = `// このファイルはビルド時に自動生成されます
// 環境変数 GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET から生成されます
export const BUILD_CONFIG = {
  GOOGLE_CLIENT_ID: ${JSON.stringify(clientId)},
  GOOGLE_CLIENT_SECRET: ${JSON.stringify(clientSecret)},
};
`;

const outputPath = path.join(__dirname, '..', 'main', 'build-config.ts');
fs.writeFileSync(outputPath, configContent, 'utf-8');

console.log('✅ ビルド設定ファイルを生成しました:', outputPath);
console.log('   GOOGLE_CLIENT_ID:', clientId ? '設定済み' : '未設定');
console.log('   GOOGLE_CLIENT_SECRET:', clientSecret ? '設定済み' : '未設定');
