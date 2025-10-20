# TSV to CSV Converter

TSVファイルをCSVに変換してGoogle Driveにアップロードするデスクトップアプリケーション

## 機能

- TSVファイルを選択してCSVに変換
- カスタム出力ファイル名の指定
- Google Drive連携でファイルをアップロード（更新）
- **認証情報を暗号化して安全に保存**（Electron Store使用）
- 設定とトークンを暗号化してローカルに保存

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（ビルド時に認証情報を埋め込む場合）

`.env.example` をコピーして `.env` ファイルを作成し、Google Cloud Consoleで取得した認証情報を設定します：

```bash
# .env.example を .env にコピー
cp .env.example .env

# .env ファイルを編集して認証情報を設定
GOOGLE_CLIENT_ID=your_client_id_here
### 4. アプリケーションの起動
GOOGLE_FOLDER_ID=your_folder_id_here
```

**重要:** `.env` ファイルは `.gitignore` に含まれており、Gitにコミットされません。

**注意:** ビルド時に認証情報を埋め込まない場合は、アプリ起動後にUIから入力できます。

### 3. Google Cloud Consoleの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
### 5. アプリケーションのビルド

実行可能ファイルを生成するには：

```bash
# 全プラットフォーム向けビルド
npm run build

# Mac用のみ
npm run build:mac

# Windows用のみ
npm run build:win
```

ビルドされたファイルは `dist/` フォルダに生成されます。

**注意:** ビルド前に `.env` ファイルに認証情報を設定しておくと、ビルドされたアプリに認証情報が埋め込まれます。

2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuthクライアントID」を選択
5. アプリケーションの種類: 「デスクトップアプリ」を選択
6. Client IDとClient Secretを取得
7. 「APIとサービス」→「ライブラリ」から「Google Drive API」を有効化

### 3. アプリケーションの起動

```bash
npm start
```

### ビルド時の認証情報埋め込み
- `.env` ファイルの認証情報は `config.js` にビルドされます
- `config.js` と `.env` は `.gitignore` に含まれ、Gitにコミットされません
- ビルドされたバイナリには認証情報が埋め込まれます（難読化されています）

### 実行時のセキュリティ
開発モード（ログ有効）:
```bash
npm run dev
```

## 使い方
### 推奨事項
- ビルドされたバイナリを配布する場合は、信頼できる相手のみに配布してください
- より高いセキュリティが必要な場合は、ビルド時に認証情報を埋め込まず、ユーザーに入力してもらう方式を推奨します


### ステップ1: TSVファイルを選択
- 「TSVファイルを選択」ボタンをクリック
- 変換したいTSVファイルを選択

### ステップ2: 変換設定
- （オプション）出力ファイル名を指定
- 「CSVに変換」ボタンをクリック

### ステップ3: Google Drive連携（オプション）
1. Google Cloud ConsoleのClient IDとClient Secretを入力
3. 「認証情報を保存」ボタンをクリック（暗号化して保存されます）
4. 「Google Drive認証」ボタンをクリック
5. ブラウザで表示されたURLを開いて認証
6. 認証コードをコピーして入力欄に貼り付け
7. 「認証コードを送信」ボタンをクリック
6. 「認証コードを送信」ボタンをクリック

### ステップ4: アップロード
- 「Google Driveにアップロード」ボタンをクリック
- 既存ファイルがあれば更新、なければ新規作成

## フォルダIDの取得方法

Google Driveでアップロード先のフォルダをブラウザで開き、URLから取得します:

```
https://drive.google.com/drive/folders/[フォルダID]
                                        ↑この部分
## セキュリティ

- **Client IDとClient Secretは暗号化されてローカルに保存されます**
- **認証トークンも暗号化されて保存されます**
- Electron Storeを使用し、暗号化キーでデータを保護
- 認証情報は画面上でマスク表示（●●●●）されます
- 「認証情報をクリア」ボタンで保存された情報を削除できます

```

- Client IDとClient Secretは安全に保管してください
- 初回使用時は認証情報を入力して保存する必要があります
- 認証情報は暗号化されてローカルマシンにのみ保存されます
- 認証トークンはlocalStorageに保存されます
- TSVファイルのフィールドにカンマや改行が含まれる場合は自動的にエスケープされます

## トラブルシューティング

### 認証エラーが発生する
- Client IDとClient Secretが正しいか確認
- Google Drive APIが有効化されているか確認
- リダイレクトURIが `http://localhost:3000/oauth2callback` に設定されているか確認

### アップロードエラーが発生する
- 認証が完了しているか確認
- フォルダIDが正しいか確認（空欄でもOK）
- Google Driveの容量が十分か確認

## ライセンス

MIT
