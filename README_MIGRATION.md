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

このコマンドは以下を自動実行します:
1. `.env` ファイルから環境変数を読み込み
2. `main/build-config.ts` に認証情報を埋め込み
3. Next.js レンダラープロセスと Electron メインプロセスを起動

## ビルド

配布用のアプリケーションをビルド:

```bash
npm run build
```

**重要**: ビルド時には環境変数 `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が必要です。

- **ローカルビルド**: `.env` ファイルから自動的に読み込まれます
- **GitHub Actionsビルド**: Repository Secrets に設定した値が使用されます

ビルドプロセス:
1. `scripts/generate-config.js` が環境変数を読み込み
2. `main/build-config.ts` に認証情報を埋め込み（機密情報なのでgitignore対象）
3. 認証情報が埋め込まれた実行可能ファイル（.exe）を生成

ビルドされたアプリケーションは `dist` ディレクトリに出力されます。

### GitHub Actionsでのリリースビルド

1. Repository Settings → Secrets and variables → Actions → Repository secrets
2. 以下のシークレットを設定:
   - `GOOGLE_CLIENT_ID`: Google Cloud Console で取得したクライアントID
   - `GOOGLE_CLIENT_SECRET`: Google Cloud Console で取得したクライアントシークレット
3. タグをプッシュしてリリースビルドをトリガー:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

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

- **Google OAuth2.0 トークン**: `electron-store` で暗号化して保存されます
- **認証情報（Client ID/Secret）**: 
  - 開発環境: `.env` ファイルで管理（gitignoreで除外）
  - リリース版: ビルド時に実行ファイルに埋め込まれます
  - `main/build-config.ts` は自動生成され、gitignoreで除外されます
- **コンテキストアイソレーション**: `contextIsolation: true` を有効化

**注意**: リリースビルドされた実行ファイルには認証情報が含まれるため、リバースエンジニアリングのリスクがあります。機密性の高いアプリケーションでは、別の認証方式（サーバーサイド認証など）の検討を推奨します。

## トラブルシューティング

### ビルドエラー

```bash
# distとnode_modulesをクリーンアップ
rm -rf dist node_modules
npm install
npm run dev
```

### 認証エラー「環境変数の設定が不完全です」

**開発環境の場合:**
- `.env` ファイルが正しく設定されているか確認
- `.env.example` を参考に、`GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を設定

**リリースビルドの場合:**
- ビルド時に環境変数が正しく設定されているか確認
- GitHub Actionsの場合、Repository Secrets が正しく設定されているか確認
- `main/build-config.ts` が正しく生成されているか確認（開発環境でテスト可能）

### その他の認証エラー

- Google Cloud Console でリダイレクト URI が正しく設定されているか確認
- ポート3000が他のアプリケーションで使用されていないか確認

## ライセンス

MIT

## 作者

Yoshihide Shiono (shiono.yoshihide@gmail.com)
