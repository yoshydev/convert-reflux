import fs from 'fs';
import path from 'path';

import { google } from 'googleapis';

import * as config from '../utils/config';

/**
 * アプリ専用フォルダを取得または作成
 */
async function getOrCreateAppFolder(drive: any): Promise<string> {
  try {
    let folderId = config.getFolderId();

    if (folderId) {
      try {
        await drive.files.get({ fileId: folderId });
        console.log('既存のフォルダを使用:', folderId);
        return folderId;
      } catch (error) {
        console.log('保存されていたフォルダが見つかりません。新しく作成します。');
        folderId = undefined;
      }
    }

    const searchResponse = await drive.files.list({
      q: `name='${config.APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (searchResponse.data.files && searchResponse.data.files.length > 0) {
      folderId = searchResponse.data.files[0].id;
      console.log('既存のフォルダを発見:', folderId);
    } else {
      const folderMetadata = {
        name: config.APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name'
      });

      folderId = folder.data.id;
      console.log('新しいフォルダを作成:', folderId);
    }

    config.saveFolderId(folderId);
    return folderId;
  } catch (error) {
    console.error('フォルダの取得/作成エラー:', error);
    throw error;
  }
}

/**
 * Google Driveにファイルをアップロード
 */
export async function uploadToDrive(
  oauth2Client: any,
  filePath: string,
  fileName?: string
): Promise<any> {
  if (!oauth2Client) {
    throw new Error('Google Drive認証が完了していません');
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const folderId = await getOrCreateAppFolder(drive);

  const uploadFileName = fileName || path.basename(filePath);

  const searchQuery = `name='${uploadFileName}' and '${folderId}' in parents and trashed=false`;

  const response = await drive.files.list({
    q: searchQuery,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  let fileId: string;
  let action: string;

  if (response.data.files && response.data.files.length > 0) {
    fileId = response.data.files[0].id as string;
    await drive.files.update({
      fileId,
      media: {
        mimeType: 'text/csv',
        body: fs.createReadStream(filePath)
      }
    });
    action = 'updated';
  } else {
    const file = await drive.files.create({
      requestBody: {
        name: uploadFileName,
        parents: [folderId]
      },
      media: {
        mimeType: 'text/csv',
        body: fs.createReadStream(filePath)
      },
      fields: 'id, webViewLink'
    });

    fileId = file.data.id as string;
    action = 'created';
  }

  const fileInfo = await drive.files.get({
    fileId,
    fields: 'id, name, webViewLink, modifiedTime'
  });

  const folderInfo = await drive.files.get({
    fileId: folderId,
    fields: 'id, name, webViewLink'
  });

  return {
    fileId,
    action,
    fileInfo: fileInfo.data,
    folderInfo: folderInfo.data
  };
}

export { getOrCreateAppFolder };
