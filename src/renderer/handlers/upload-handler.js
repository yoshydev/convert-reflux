/**
 * Google Driveアップロードのイベントハンドラー
 */

/**
 * Google Driveアップロードハンドラー
 */
export async function handleUpload(elements, state) {
  if (!state.selectedFilePath) {
    elements.updateStatus('先にTSVファイルを選択してください', 'warning');
    return;
  }

  if (!state.isAuthenticated) {
    elements.updateStatus('先にGoogle Drive認証を完了してください', 'warning');
    return;
  }

  try {
    elements.uploadBtn.disabled = true;

    // 変換処理を実行（ファイル名は「inf_score.csv」固定）
    elements.updateStatus('TSVをCSVに変換中...', 'info');
    const convertResult = await window.electronAPI.convertTsvToCsv(state.selectedFilePath, 'inf_score.csv');

    if (!convertResult.success) {
      elements.updateStatus(`変換エラー: ${convertResult.error}`, 'error');
      elements.uploadBtn.disabled = false;
      return;
    }

    state.setConvertedFile(convertResult.csvPath);
    elements.updateStatus(`✓ CSV変換完了: ${convertResult.fileName}\nGoogle Driveにアップロード中...`, 'info');

    // 保存されたトークンを設定
    await window.electronAPI.setTokens();

    const result = await window.electronAPI.uploadToDrive({
      filePath: convertResult.csvPath,
      fileName: 'inf_score.csv'
    });

    if (result.success) {
      const actionText = result.action === 'updated' ? '更新' : '作成';
      elements.updateStatus(
        `✓ Google Driveに${actionText}しました!\n` +
        `フォルダ: ${result.folderInfo.name}\n` +
        `ファイル名: ${result.fileInfo.name}\n` +
        `ファイルID: ${result.fileInfo.id}\n` +
        `更新日時: ${result.fileInfo.modifiedTime}\n` +
        (result.fileInfo.webViewLink ? `ファイルURL: ${result.fileInfo.webViewLink}\n` : '') +
        (result.folderInfo.webViewLink ? `フォルダURL: ${result.folderInfo.webViewLink}` : ''),
        'success'
      );
      elements.uploadBtn.disabled = false;
    } else {
      elements.updateStatus(`アップロードエラー: ${result.error}`, 'error');
      elements.uploadBtn.disabled = false;
    }
  } catch (error) {
    elements.updateStatus(`エラー: ${error.message}`, 'error');
    elements.uploadBtn.disabled = false;
  }
}
