# ESLint Setup Guide

このプロジェクトではESLintを使用してコード品質を維持しています。

## 利用可能なコマンド

```bash
# ESLintでコードをチェック
npm run lint

# ESLintで自動修正可能な問題を修正
npm run lint:fix

# 警告を含めてすべての問題をチェック（CI用）
npm run lint:check

# TypeScriptの型チェック
npm run type-check

# 開発時の全チェック（型チェック + lint）
npm run dev:lint

# ビルド前の全チェック（型チェック + lint、警告なし）
npm run prebuild:check
```

## ESLint設定

- **ファイル**: `eslint.config.js`
- **対象**: `main/`と`renderer/`ディレクトリ内の`.ts`, `.tsx`, `.js`, `.jsx`ファイル
- **除外**: `node_modules`, `dist`, `build`, `app`, `.next`などのビルド成果物

## 主なルール

### TypeScript
- 未使用変数のエラー（`_`で始まる変数は除外）
- `any`型の使用は警告
- Non-null assertionは警告

### React
- React importは不要（Next.js環境）
- Prop typesはTypeScriptで代替
- Hooksのルールを適用

### Import
- インポート順序の自動整理
- 空行によるグループ分け
- アルファベット順での並び替え

### 一般
- `console`文は警告（main processでは許可）
- `var`の使用禁止
- `const`の優先使用
- オブジェクトショートハンド記法の強制

## VS Code統合

VS Codeでは以下の機能が利用できます：

1. **保存時自動修正**: ファイル保存時にESLintが自動的に修正可能な問題を修正
2. **リアルタイム表示**: コード編集中にリアルタイムでエラーと警告を表示
3. **推奨拡張機能**: ESLint、TailwindCSS、TypeScript拡張機能

## トラブルシューティング

### TypeScript警告
```
Multiple projects found, consider using a single `tsconfig` with `references` to speed up
```
これは複数のtsconfig.jsonファイルがあることによる警告で、動作に影響はありません。

### 除外ファイル
ビルド成果物やnode_modulesは自動的に除外されるため、エラーが表示されることはありません。

## カスタマイズ

プロジェクト固有のルールを追加したい場合は、`eslint.config.js`の`rules`セクションを編集してください。