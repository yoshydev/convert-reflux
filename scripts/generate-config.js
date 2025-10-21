#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * 環境変数の値からクォートを除去してトリミング
 * .envファイルの標準的な動作に従い:
 * - KEY=value → value (前後の空白をトリミング)
 * - KEY='value' → value (シングルクォートを除去、内部の空白は保持)
 * - KEY="value" → value (ダブルクォートを除去、内部の空白は保持)
 * - KEY="  value  " → "  value  " (クォート内の空白は保持)
 * 
 * @param {string} value - 環境変数の値
 * @returns {string} - クォートを除去した値
 */
function parseEnvValue(value) {
  // まず全体をトリミング
  let trimmed = value.trim();

  // シングルクォートまたはダブルクォートで囲まれている場合は除去
  // クォート内の空白は保持される
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    trimmed = trimmed.slice(1, -1);
  }

  return trimmed;
}

// .envファイルから環境変数を読み込む（存在する場合）
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath) && !process.env.GOOGLE_CLIENT_ID) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    // コメント行と空行をスキップ
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    // KEY=VALUE形式を解析（=の最初の出現位置で分割）
    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1);

    // キーが有効な環境変数名の形式かチェック
    if (/^[A-Z_][A-Z0-9_]*$/i.test(key) && !process.env[key]) {
      process.env[key] = parseEnvValue(value);
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
