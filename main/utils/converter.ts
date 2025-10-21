import { promises as fs } from 'fs';
import path from 'path';

// MODEの定義
const MODES = ['SPB', 'SPN', 'SPH', 'SPA', 'SPL', 'DPN', 'DPH', 'DPA', 'DPL'] as const;
type Mode = typeof MODES[number];

// LAMPマッピング
const LAMP_MAPPING: Record<string, string> = {
  'NP': 'NO PLAY',
  'F': 'FAILED',
  'AC': 'A-CLEAR',
  'EC': 'E-CLEAR',
  'NC': 'CLEAR',
  'HC': 'H-CLEAR',
  'EX': 'EXH-CLEAR',
  'FC': 'F-COMBO',
  'PFC': 'F-COMBO'
};

interface TsvRow {
  title: string;
  [key: string]: string | number;
}

interface CsvRecord {
  LV: string;
  Title: string;
  mode: string;
  Lamp: string;
  Score: string;
  rate: string;
  BP: string;
  'Opt(best score)': string;
  'Opt(min bp)': string;
  'Last Played': string;
}

/**
 * TSVヘッダーを解析してカラムインデックスを取得
 */
function parseHeader(headerLine: string): Map<string, number> {
  const columns = headerLine.split('\t');
  const columnMap = new Map<string, number>();

  columns.forEach((column, index) => {
    columnMap.set(column.trim(), index);
  });

  return columnMap;
}

/**
 * TSV行を解析してオブジェクトに変換
 */
function parseTsvRow(line: string, columnMap: Map<string, number>): TsvRow {
  const fields = line.split('\t');
  const row: TsvRow = { title: '' };

  columnMap.forEach((index, columnName) => {
    if (fields[index] !== undefined) {
      row[columnName] = fields[index].trim();
    }
  });

  return row;
}

/**
 * レート計算（切り捨て）
 */
function calculateRate(exScore: number, noteCount: number): string {
  if (noteCount === 0) return '0.0';
  const rate = (exScore / (noteCount * 2)) * 100;
  return Math.floor(rate * 10) / 10 + '';
}

/**
 * 現在日時を取得
 */
function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * MODEごとのデータを抽出してCSVレコードに変換
 */
function extractModeData(row: TsvRow, mode: Mode, columnMap: Map<string, number>): CsvRecord | null {
  const lampColumn = `${mode} Lamp`;
  const ratingColumn = `${mode} Rating`;
  const exScoreColumn = `${mode} EX Score`;
  const noteCountColumn = `${mode} Note Count`;
  const missCountColumn = `${mode} Miss Count`;

  const lamp = row[lampColumn] as string;

  // NP以外の場合のみ処理
  if (!lamp || lamp === 'NP') {
    return null;
  }

  const rating = row[ratingColumn] as string;
  const exScore = parseInt(row[exScoreColumn] as string) || 0;
  const noteCount = parseInt(row[noteCountColumn] as string) || 0;
  const missCount = row[missCountColumn] as string;
  const title = row.title || row['title'] || '';

  // Miss Countが'-'の場合は空文字、それ以外はそのまま使用
  const bp = missCount === '-' ? '' : missCount;

  return {
    LV: rating ? `☆${rating}` : '',
    Title: title,
    mode,
    Lamp: LAMP_MAPPING[lamp] || lamp,
    Score: exScore.toString(),
    rate: calculateRate(exScore, noteCount),
    BP: bp,
    'Opt(best score)': '?',
    'Opt(min bp)': '?',
    'Last Played': getCurrentDateTime()
  };
}

/**
 * CSVレコードをCSV行に変換
 */
function csvRecordToLine(record: CsvRecord): string {
  const fields = [
    record.LV,
    record.Title,
    record.mode,
    record.Lamp,
    record.Score,
    record.rate,
    record.BP || '',
    record['Opt(best score)'],
    record['Opt(min bp)'],
    record['Last Played']
  ];

  // CSVエスケープ処理
  const escapedFields = fields.map(field => {
    const fieldStr = String(field);
    if (fieldStr.includes(',') || fieldStr.includes('\n') || fieldStr.includes('"')) {
      return `"${fieldStr.replace(/"/g, '""')}"`;
    }
    return fieldStr;
  });

  return escapedFields.join(',');
}

/**
 * TSVファイルをCSVに変換（Reflux形式からInfinitas Counter形式へ）
 * @param tsvPath - TSVファイルのパス
 * @param outputFileName - 出力ファイル名（オプション）
 * @returns 変換結果
 */
export async function convertTsvToCsv(
  tsvPath: string,
  outputFileName?: string
): Promise<{ success: boolean; csvPath?: string; fileName?: string; error?: string }> {
  try {
    const tsvContent = await fs.readFile(tsvPath, 'utf-8');
    const lines = tsvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('TSVファイルが空か、ヘッダー行がありません');
    }

    // ヘッダー行を解析
    const headerLine = lines[0];
    const columnMap = parseHeader(headerLine);

    // 必要なカラムが存在するかチェック
    const requiredColumns = ['title'];
    for (const mode of MODES) {
      requiredColumns.push(`${mode} Lamp`);
    }

    const missingColumns = requiredColumns.filter(col => !columnMap.has(col));
    if (missingColumns.length > 0) {
      throw new Error(`必要なカラムが見つかりません: ${missingColumns.join(', ')}`);
    }

    // データ行を処理
    const csvRecords: CsvRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      try {
        const row = parseTsvRow(line, columnMap);

        // 各MODEをチェック
        for (const mode of MODES) {
          const record = extractModeData(row, mode, columnMap);
          if (record) {
            csvRecords.push(record);
          }
        }
      } catch (error) {
        console.warn(`行 ${i + 1} の処理をスキップしました:`, error);
      }
    }

    // CSVヘッダーとデータを生成
    const csvHeader = 'LV,Title,mode,Lamp,Score,(rate),BP,Opt(best score),Opt(min bp),Last Played';
    const csvLines = [csvHeader, ...csvRecords.map(csvRecordToLine)];
    const csvContent = csvLines.join('\n');

    // ファイル出力
    const dir = path.dirname(tsvPath);
    const finalOutputName = outputFileName || path.basename(tsvPath).replace(/\.tsv$/i, '.csv');
    const csvPath = path.join(dir, finalOutputName);

    await fs.writeFile(csvPath, csvContent, 'utf-8');

    console.log(`変換完了: ${csvRecords.length} レコードを生成しました`);

    return {
      success: true,
      csvPath,
      fileName: finalOutputName
    };

  } catch (error) {
    console.error('Convert error:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}
