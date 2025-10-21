# Reflux Converter

TSVファイルをCSVに変換してGoogle Driveにアップロードするデスクトップアプリケーション

## 技術スタック

- **Electron**: デスクトップアプリケーションフレームワーク
- **Next.js**: React フレームワーク（フロントエンド）
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: スタイリング
- **Nextron**: Electron + Next.js 統合フレームワーク
- **Google Drive API**: ファイルアップロード

## 前提条件

- Node.js (v18以上)
- npm または yarn
- Google Cloud Console で作成したOAuth2.0クライアント

## セットアップ

### 1. 依存関係のインストール

```bash
cd reflux-converter
npm install
```

### 2. Google Cloud Console の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成
3. Google Drive API を有効化
4. OAuth 2.0 クライアント ID を作成
   - アプリケーションの種類: デスクトップアプリ
   - 承認済みのリダイレクト URI: `http://localhost:3000/oauth2callback`
5. クライアント ID とクライアントシークレットを取得

### 3. 環境変数の設定

`.env` ファイルを作成して、Google の認証情報を設定します。

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## 開発

開発モードで起動:

```bash
npm run dev
```

`.env` ファイルから環境変数が直接読み込まれます。

## ビルド

配布用のアプリケーションをビルド:

```bash
npm run build
```

ビルドされたアプリケーションは `dist` ディレクトリに出力されます。

## 使い方

### 1. 設定

1. **TSVファイルパス設定**
   - 「📂 参照」ボタンをクリックして、定期的にアップロードするTSVファイルを選択
   - 選択したパスは自動的に保存されます

2. **Google Drive 認証**
   - 「🔐 Google Drive 認証」ボタンをクリック
   - ブラウザが開き、Googleアカウントでの認証を求められます
   - 承認すると、トークンが安全に保存されます

### 2. アップロード

1. 設定が完了すると、「☁️ アップロード」タブが有効になります
2. 「☁️ Google Driveにアップロード」ボタンをクリック
3. TSVファイルが `inf_score.csv` に変換され、Google Driveの `Reflux-Converter` フォルダにアップロードされます

## プロジェクト構造

```
reflux-converter/
├── main/                    # メインプロセス（Electron）
│   ├── background.ts        # アプリケーションのエントリーポイント
│   ├── preload.ts          # コンテキストブリッジ（IPC通信）
│   ├── handlers/           # IPCハンドラー
│   ├── services/           # ビジネスロジック
│   │   ├── auth.ts        # Google認証
│   │   ├── drive.ts       # Google Drive操作
│   │   └── auth-page.html # 認証完了ページ
│   └── utils/             # ユーティリティ
│       ├── config.ts      # 設定管理
│       ├── converter.ts   # TSV/CSV変換
│       └── wsl.ts        # WSL対応
├── renderer/              # レンダラープロセス（Next.js）
│   ├── pages/
│   │   ├── home.tsx      # メインページ
│   │   └── _app.tsx      # Next.js アプリ設定
│   └── styles/
│       └── globals.css   # グローバルスタイル
├── resources/            # アプリアイコンなど
├── electron-builder.yml  # Electron Builderの設定
├── package.json
└── tsconfig.json
```

## セキュリティ

- Google OAuth2.0 トークンは `electron-store` で暗号化して保存されます
- 認証情報（Client ID/Secret）は `.env` ファイルで管理され、実行時に読み込まれます
- コンテキストアイソレーション（`contextIsolation: true`）を有効化

## トラブルシューティング

### ビルドエラー

```bash
# distとnode_modulesをクリーンアップ
rm -rf dist node_modules
npm install
npm run dev
```

### 認証エラー

- `.env` ファイルが正しく設定されているか確認
- Google Cloud Console でリダイレクト URI が正しく設定されているか確認
- ポート3000が他のアプリケーションで使用されていないか確認

## ライセンス

MIT

## 作者

Yoshihide Shiono (shiono.yoshihide@gmail.com)
