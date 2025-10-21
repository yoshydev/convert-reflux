# 開発者向けドキュメント

このドキュメントは、Reflux Converterの開発環境構築と開発手順について説明します。

## 技術スタック

- **フレームワーク**: [Nextron](https://github.com/saltyshiomix/nextron) (Electron + Next.js)
- **言語**: TypeScript
- **UI**: React + Tailwind CSS
- **バンドラー**: Webpack
- **パッケージマネージャー**: npm/yarn/pnpm

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- npm/yarn/pnpm

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/yoshydev/convert-reflux.git
cd convert-reflux
```

2. 依存関係をインストール
```bash
# npm の場合
npm install

# yarn の場合
yarn install

# pnpm の場合
pnpm install --shamefully-hoist
```

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev
# または
yarn dev
# または
pnpm run dev

# 本番ビルド
npm run build
# または
yarn build
# または
pnpm run build

# アプリケーションパッケージング
npm run dist
# または
yarn dist
# または
pnpm run dist
```

## プロジェクト構造

```
├─ app/                    # Electron メインプロセス（コンパイル済み）
├─ main/                   # Electron メインプロセス（TypeScript）
│  ├─ background.ts        # メインプロセスエントリーポイント
│  ├─ preload.ts          # プリロードスクリプト
│  ├─ handlers/           # IPCハンドラー
│  ├─ helpers/            # ヘルパー関数
│  ├─ services/          # サービス層（認証、Drive API等）
│  └─ utils/             # ユーティリティ
├─ renderer/              # レンダラープロセス（Next.js）
│  ├─ components/        # Reactコンポーネント
│  ├─ hooks/            # カスタムフック
│  ├─ pages/            # Next.jsページ
│  ├─ public/           # 静的ファイル
│  └─ styles/           # スタイルシート
└─ resources/            # アプリケーションリソース
```

## 開発ガイドライン

### コーディング規約

- ESLintとPrettierの設定に従う
- TypeScriptの型定義を適切に行う
- コンポーネントはPascalCase、関数はcamelCaseを使用

### Git ワークフロー

1. `main`ブランチから新しいブランチを作成
2. 機能開発またはバグ修正を実施
3. プルリクエストを作成
4. レビュー後、`main`ブランチにマージ

### ビルドとリリース

#### 開発ビルド
```bash
npm run build
```

#### リリースビルド
```bash
npm run dist
```

リリースファイルは`dist/`フォルダに生成されます。

## API設計

### IPC通信

メインプロセスとレンダラープロセス間の通信にはIPCを使用しています。

主要なIPCチャンネル：
- `google-auth`: Google Drive認証
- `file-convert`: ファイル変換処理
- `file-upload`: ファイルアップロード
- `config-get/set`: 設定の取得・保存

### Google Drive API

`main/services/drive.ts`にGoogle Drive APIの操作を実装しています。

主要な機能：
- ファイルのアップロード
- フォルダ作成
- ファイル検索
- 権限管理

## テスト

```bash
# テスト実行
npm run test

# テストカバレッジ
npm run test:coverage
```

## トラブルシューティング

### よくある問題

1. **依存関係のインストールエラー**
   - Node.jsのバージョンを確認
   - `node_modules`を削除して再インストール

2. **ビルドエラー**
   - TypeScriptのエラーを確認
   - 型定義ファイルの更新

3. **Electron起動エラー**
   - メインプロセスのコンパイルエラーを確認
   - `app/`フォルダの生成状況を確認

### デバッグ

開発モードでは以下のデバッグ機能が利用できます：
- Chrome DevTools（レンダラープロセス）
- VS Code Debugger（メインプロセス）
- Electronのログ出力

## 貢献方法

1. Issueを作成して問題や改善提案を報告
2. フォークしてプルリクエストを送信
3. コードレビューに参加

## 参考資料

- [Nextron Documentation](https://github.com/saltyshiomix/nextron)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Drive API](https://developers.google.com/drive/api)

---

質問や問題がある場合は、[GitHub Issues](https://github.com/yoshydev/convert-reflux/issues)までお気軽にお寄せください。