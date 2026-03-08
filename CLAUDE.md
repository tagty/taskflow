# CLAUDE.md

Personal Dev OS — 個人向けタスク管理アプリ。

## コマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # ビルド（実装後に必ず実行して検証する）
npm run lint          # ESLint
npm run test          # Vitest ユニットテスト
npm run test:e2e      # Playwright スクリーンショット比較
npm run test:e2e:update  # スクリーンショットのベースライン更新
npx supabase db push  # DBマイグレーションをリモートに適用
```

## UI検証ワークフロー

`claude --chrome` で起動すると Chrome を直接操作できる。UI変更後の検証例：
- `localhost:3000 を開いてプロジェクト作成フォームをテストして。コンソールエラーも確認して`
- `UIを変更したので localhost:3000 のスクリーンショットを撮って tests/visual.spec.ts-snapshots/ と比較して`

## アーキテクチャ

- **フレームワーク**: Next.js App Router + TypeScript
- **DB**: Supabase (PostgreSQL) — `src/lib/supabase/queries.ts` にクエリを集約
- **スタイル**: Tailwind CSS
- **サーバーアクション**: 各ページの `actions.ts` に定義（`"use server"`）
- **共通コンポーネント**: `src/components/`

## ディレクトリ構造

```
src/
  app/
    projects/         # プロジェクト一覧・作成
    projects/[id]/    # プロジェクト詳細・タスク管理
    today/            # 今日のタスク
    history/          # 完了履歴
  components/         # 共有UIコンポーネント
  lib/supabase/       # client.ts / admin.ts / queries.ts
supabase/migrations/  # DBマイグレーションファイル
```

## データモデル

- `projects` — id, name, color, description
- `tasks` — id, project_id, title, status(`todo`/`doing`/`done`), due_date, scheduled_for, completed_at
- `task_notes` — id, task_id, body

## 開発ルール

- タスクは `tasks.md` で管理。作業前に Doing へ、完了後に Done へ移動する
- DBスキーマ変更は必ずマイグレーションファイルで管理（`npx supabase migration new <name>`）
- `supabaseAdmin`（service_role key）はサーバー側のみ。クライアントでは `supabase`（publishable key）を使う
- コード変更後は `npm run build` でエラーがないことを確認する（lint はフックで自動実行される）
