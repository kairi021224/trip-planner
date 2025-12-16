# Repository Guidelines

## プロジェクト構成
- Next.js 16 (App Router) + TypeScript。`app/page.tsx` が旅程フォームのMVP、`app/map/page.tsx` と `app/components/MapView.tsx` が MapLibre デモ。共通レイアウトは `app/layout.tsx`。
- スタイルは Tailwind CSS v4 と `app/globals.css` に集約。公共アセットは `public/`、設定/リンターは `eslint.config.mjs` と `next.config.ts` に配置。
- 型定義・コンパイル設定は `tsconfig.json`。依存管理は npm (`package-lock.json` をコミット) で行う。

## 開発・ビルド・検証
- Node 20.x 前提。初回セットアップは `npm install`。
- ローカル開発: `npm run dev`（App Router の開発サーバー、Webpack 使用）。
- 本番ビルド: `npm run build`。ビルド成果物からの起動: `npm run start`。
- 静的検証: `npm run lint`（Next.js 推奨 ESLint ルール）。警告・エラーは解消してから PR を作成。
- MapLibre のスタイルはデモ URL を参照中。API キー導入時は `.env.local` に置き、秘匿情報をリポジトリに含めない。

## コーディングスタイル
- 2 スペースインデント、セミコロンなし。JSX は関数コンポーネント＋フック中心。Props/状態は TypeScript の型を定義してから使用。
- コンポーネント名・ファイル名は PascalCase（例: `MapView.tsx`）、変数・関数は camelCase。イベントハンドラは `on*` プレフィックスで統一。
- UI 文言は日本語、識別子は既存規約を踏襲。不要なカスタム CSS は避け、Tailwind ユーティリティを優先する。

## テスト方針
- 現状自動テストは未導入。新規ロジックを追加する際は `__tests__/` または隣接ファイルに `*.test.ts(x)` を置く想定（Vitest/Jest いずれかで構成可）。
- UI 変更時は `npm run dev` で `app/` 配下の画面を手動確認し、フォームバリデーションや地図のズーム・ポップアップ挙動をチェックする。
- 将来的に外部 API を繋ぐ場合は、モックデータと実呼び出しを切り替えられるよう依存を関数注入で分離する。

## コミット/PR 運用
- Git 履歴は短い要約と `feat:`/`chore:` などの prefix が多め。可能なら Conventional Commits を踏襲（例: `feat: connect map to API`）。
- PR では目的・変更点・確認手順を箇条書きし、UI 変更はスクリーンショットや挙動の GIF を添付。関連 Issue を明記して、レビュアーが再現できる情報を残す。
- 大きな機能は小さく分割し、型の整備・リファクタと振る舞い変更は別コミットに分ける。依存追加時は理由と影響範囲を書き添える。
