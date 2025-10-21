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

      if (state.isAuthenticated) {
        elements.uploadBtn.disabled = false;
        elements.updateStatus('ファイルが選択されました。アップロードボタンをクリックしてください。', 'success');
      } else {
        elements.updateStatus('ファイルが選択されました。Google Drive認証を完了してください。', 'info');
      }
    }
  } catch (error) {
    elements.updateStatus(`エラー: ${error.message}`, 'error');
  }
}
