import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as config from '../utils/config';
import { convertTsvToCsv } from '../utils/converter';
import * as auth from '../services/auth';
import * as drive from '../services/drive';

/**
 * すべてのIPCハンドラーを登録
 */
export function registerIpcHandlers(mainWindow: BrowserWindow): void {
    // ビルド時の設定情報を取得
    ipcMain.handle('get-build-config', async () => {
        return config.getBuildConfig();
    });

    // ファイル選択ダイアログ
    ipcMain.handle('select-tsv-file', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'TSV Files', extensions: ['tsv'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (result.canceled) {
            return null;
        }
        return result.filePaths[0];
    });

    // TSVをCSVに変換
    ipcMain.handle('convert-tsv-to-csv', async (_event, tsvPath: string, outputFileName?: string) => {
        try {
            return await convertTsvToCsv(tsvPath, outputFileName);
        } catch (error) {
            console.error('Convert error:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // 認証情報をクリア
    ipcMain.handle('clear-credentials', async () => {
        try {
            config.clearCredentials();
            return { success: true };
        } catch (error) {
            console.error('Clear credentials error:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // Google Drive認証の初期化
    ipcMain.handle('init-google-auth', async (_event, credentials: { clientId?: string; clientSecret?: string }) => {
        try {
            const result = await auth.initGoogleAuth(credentials, mainWindow);
            return result;
        } catch (error) {
            console.error('Auth init error:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // トークンを設定
    ipcMain.handle('set-tokens', async (_event, tokens: any) => {
        try {
            auth.restoreOAuth2Client(tokens);
            return { success: true };
        } catch (error) {
            console.error('Set tokens error:', error);
            return { success: false, error: (error as Error).message };
        }
    });

    // Google Driveにアップロード
    ipcMain.handle('upload-to-drive', async (_event, { filePath, fileName }: { filePath: string; fileName?: string }) => {
        try {
            const oauth2Client = auth.getOAuth2Client();
            const result = await drive.uploadToDrive(oauth2Client, filePath, fileName);
            return { success: true, ...result };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, error: (error as Error).message };
        }
    });
}
