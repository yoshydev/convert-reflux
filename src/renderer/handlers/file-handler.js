/**
 * ファイル操作のイベントハンドラー
 */

/**
 * ファイル選択ハンドラー
 */
export async function handleFileSelect(elements, state) {
  try {
    const filePath = await window.electronAPI.selectTsvFile();

    if (filePath) {
      state.setSelectedFile(filePath);
      elements.showSelectedFile(filePath);
      elements.convertBtn.disabled = false;
      elements.updateStatus('ファイルが選択されました。変換ボタンをクリックしてください。', 'success');
    }
  } catch (error) {
    elements.updateStatus(`エラー: ${error.message}`, 'error');
  }
}

/**
 * CSV変換ハンドラー
 */
export async function handleConvert(elements, state, saveOutputFileName) {
  if (!state.selectedFilePath) {
    elements.updateStatus('先にTSVファイルを選択してください', 'warning');
    return;
  }

  try {
    elements.convertBtn.disabled = true;
    elements.updateStatus('変換中...', 'info');

    const outputFileName = elements.outputFileName.value.trim() || null;
    const result = await window.electronAPI.convertTsvToCsv(state.selectedFilePath, outputFileName);

    if (result.success) {
      state.setConvertedFile(result.csvPath);
      elements.updateStatus(
        `✓ CSV変換完了!\n出力ファイル: ${result.fileName}\nパス: ${result.csvPath}`,
        'success'
      );

      if (state.isAuthenticated) {
        elements.uploadBtn.disabled = false;
      }

      saveOutputFileName(elements.outputFileName.value);
    } else {
      elements.updateStatus(`変換エラー: ${result.error}`, 'error');
      elements.convertBtn.disabled = false;
    }
  } catch (error) {
    elements.updateStatus(`エラー: ${error.message}`, 'error');
    elements.convertBtn.disabled = false;
  }
}
