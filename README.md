# Taskflow — Personal Dev OS

個人向けタスク管理アプリ。プロジェクトとタスクを管理し、今日やること・完了履歴を確認できます。

## 技術スタック

- **フレームワーク**: Next.js (App Router) + TypeScript
- **DB**: Supabase (PostgreSQL)
- **スタイル**: Tailwind CSS（ダークモード対応）

## 画面構成

| パス | 概要 |
|------|------|
| `/projects` | プロジェクト一覧・作成 |
| `/projects/[id]` | タスク一覧・作成・ステータス変更 |
| `/today` | 今日のタスク（scheduled_for / due_date が今日の未完タスク） |
| `/history` | 完了タスク履歴（completed_at 降順、30件） |

## データモデル

- `projects` — id, name, color, description
- `tasks` — id, project_id, title, status(`todo`/`doing`/`done`), due_date, scheduled_for, completed_at
- `task_notes` — id, task_id, body

## セットアップ

```bash
npm install
```

`.env.local` を作成して環境変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
```

DBマイグレーションを適用:

```bash
npx supabase db push
```

開発サーバーを起動:

```bash
npm run dev
```

## コマンド

```bash
npm run verify           # ビルド + テスト
npm run test:e2e         # Playwright スクリーンショット比較
npm run test:e2e:update  # スクリーンショットのベースライン更新
npx supabase db push     # DBマイグレーションをリモートに適用
```
