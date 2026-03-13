# CLAUDE.md

Personal Dev OS — 個人向けタスク管理アプリ。

## コマンド

```bash
npm run verify           # ビルド + テスト（タスク完了後に必ず実行）
npx supabase db push     # DBマイグレーションをリモートに適用
node scripts/record-pr-demo.js {PR番号} {PROJECT_ID}  # デモ GIF 生成 → gh-pages へデプロイ
```

## アーキテクチャ決定記録（ADR）

設計決定の背景・理由は `docs/adr/` を参照。新しい設計判断をした際は ADR を追加する。

## 開発ルール

- Tailwind CSS のダークモード `dark:` クラスを必ず付ける
- `supabaseAdmin`（secret key）はサーバー側のみ。クライアントは `supabase`（publishable key）
- DBスキーマ変更は `npx supabase migration new <name>` → `npx supabase db push`
- クエリは `src/lib/supabase/queries.ts` に集約する
- テストは `src/**/*.test.{ts,tsx}` に書く

## 開発フロー

Issue → `feature/{issue-number}-{name}` ブランチ → 実装 → テスト → `npm run verify` → commit（日本語） → PR → スクリーンショット/GIF → 次の Issue 提案

- PR には `## Demo` と `## Screenshots` セクションを必ず追加（`/pr-screenshot` スキルを参照）
- Issue・PR のフォーマットは `/github-workflow` スキルを参照

## コンテキスト圧縮時の保持事項

When compacting, always preserve:
- 変更・追加したファイルの一覧
- 未完了のタスクと次のステップ
- DBマイグレーションの適用状況
