/**
 * Google Driveアップロードのイベントハンドラー
 */

/**
 * Google Driveアップロードハンドラー
 */
export async function handleUpload(elements, state) {
  if (!state.convertedFilePath) {
    elements.updateStatus('先にファイルを変換してください', 'warning');
    return;
  }

  if (!state.isAuthenticated) {
    elements.updateStatus('先にGoogle Drive認証を完了してください', 'warning');
    return;
  }

  try {
    elements.uploadBtn.disabled = true;
    elements.updateStatus('Google Driveにアップロード中...', 'info');

    // 保存されたトークンを設定
    await window.electronAPI.setTokens();

    const outputFileName = elements.outputFileName.value.trim() || null;

    const result = await window.electronAPI.uploadToDrive({
      filePath: state.convertedFilePath,
      fileName: outputFileName
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
