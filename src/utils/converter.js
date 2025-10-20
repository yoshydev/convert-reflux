const fs = require('fs').promises;
const path = require('path');

/**
 * TSVファイルをCSVに変換
 * @param {string} tsvPath - TSVファイルのパス
 * @param {string} outputFileName - 出力ファイル名（オプション）
 * @returns {Promise<{success: boolean, csvPath?: string, fileName?: string, error?: string}>}
 */
async function convertTsvToCsv(tsvPath, outputFileName) {
  try {
    const tsvContent = await fs.readFile(tsvPath, 'utf-8');

    const lines = tsvContent.split('\n');
    const csvLines = lines.map(line => {
      const fields = line.split('\t').map(field => {
        if (field.includes(',') || field.includes('\n') || field.includes('"')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      return fields.join(',');
    });
    const csvContent = csvLines.join('\n');

    const dir = path.dirname(tsvPath);
    const finalOutputName = outputFileName || path.basename(tsvPath).replace(/\.tsv$/i, '.csv');
    const csvPath = path.join(dir, finalOutputName);

    await fs.writeFile(csvPath, csvContent, 'utf-8');

    return { success: true, csvPath, fileName: finalOutputName };
  } catch (error) {
    console.error('Convert error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  convertTsvToCsv
};
