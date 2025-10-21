const { convertTsvToCsv } = require('./app/utils/converter.js');
const path = require('path');
const fs = require('fs');

async function testConversion() {
  try {
    console.log('変換テストを開始します...');

    const tsvPath = path.join(__dirname, 'tmp', 'tracker.tsv');
    console.log(`入力ファイル: ${tsvPath}`);

    // ファイルの存在確認
    if (!fs.existsSync(tsvPath)) {
      console.error('❌ TSVファイルが見つかりません:', tsvPath);
      return;
    }

    const result = await convertTsvToCsv(tsvPath, 'test_output.csv');

    if (result.success) {
      console.log('✅ 変換成功！');
      console.log(`出力ファイル: ${result.csvPath}`);
      console.log(`ファイル名: ${result.fileName}`);

      // 生成されたCSVファイルの最初の数行を表示
      if (fs.existsSync(result.csvPath)) {
        const csvContent = fs.readFileSync(result.csvPath, 'utf-8');
        const lines = csvContent.split('\n').slice(0, 6); // 最初の6行
        console.log('\n📄 生成されたCSVの内容（最初の6行）:');
        lines.forEach((line, index) => {
          console.log(`${index + 1}: ${line}`);
        });
      }
    } else {
      console.error('❌ 変換失敗:', result.error);
    }

  } catch (error) {
    console.error('❌ テスト実行エラー:', error);
  }
}

testConversion();