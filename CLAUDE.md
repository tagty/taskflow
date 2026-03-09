# CLAUDE.md

Personal Dev OS — 個人向けタスク管理アプリ。

## コマンド

```bash
npm run verify           # ビルド + テスト（タスク完了後に必ず実行）
npm run test:e2e         # Playwright スクリーンショット比較（UI変更後）
npm run test:e2e:update  # スクリーンショットのベースライン更新
npx supabase db push     # DBマイグレーションをリモートに適用
./scripts/review-pr.sh   # PR差分を claude -p で自動レビュー
./scripts/fix-lint.sh    # lint エラーを自律修正
```

## アーキテクチャ

- **フレームワーク**: Next.js App Router + TypeScript
- **DB**: Supabase (PostgreSQL) — `src/lib/supabase/queries.ts` にクエリを集約
- **スタイル**: Tailwind CSS（ダークモード `dark:` 対応必須）
- **サーバーアクション**: 各ページの `actions.ts`（`"use server"` 必須）

## データモデル

- `projects` — id, name, color, description
- `tasks` — id, project_id, title, status(`todo`/`doing`/`done`), due_date, scheduled_for, completed_at
- `task_notes` — id, task_id, body

## 開発ルール

- `supabaseAdmin`（secret key）はサーバー側のみ。クライアントでは `supabase`（publishable key）
- DBスキーマ変更は `npx supabase migration new <name>` でマイグレーションファイルを作成
- 新機能実装は `/implement-feature` スキルに従う。パターンは `/code-patterns` を参照
- チェックポイント（`/rewind`）は git の代替ではない。節目ごとに git commit する

## PR スクリーンショットワークフロー

UI変更を含む PR では必ずスクリーンショットを生成し PR 本文に表示する。

### 手順

1. `npm run dev` でアプリを起動
2. Playwright で主要画面を撮影（1440px幅・フルページ）

```bash
npx playwright screenshot --browser chromium --viewport-size "1440,900" --full-page \
  http://localhost:3000/projects screenshots/pr-{PR_NUMBER}/projects.png
```

3. `screenshots/pr-{PR_NUMBER}/` に保存
4. GitHub Pages にデプロイ（public リポジトリ必須）
5. PR 本文の `## Screenshots` セクションを更新

### PR 本文フォーマット

```markdown
## Screenshots

### プロジェクト一覧
![](https://tagty.github.io/taskflow/pr-{PR_NUMBER}/projects.png)

### プロジェクト詳細
![](https://tagty.github.io/taskflow/pr-{PR_NUMBER}/project-detail.png)
```

### ルール

- UI変更がある場合は必ずスクリーンショットを更新する
- フルページ・画面幅 1440px 固定
- **注意**: private リポジトリでは GitHub Pages に有料プランが必要。public 化推奨。

## GitHub Workflow

Claude は PM・Engineer・Reviewer として自走する。**必ず1タスクずつ進める。**

### 開発フロー

1. Todo からタスクを選ぶ
2. GitHub Issue を作成する（`gh issue create`）
3. feature ブランチを作る（`feature/{issue-number}-{short-name}`）
4. 実装する
5. `npm run verify` で検証
6. Commit する（日本語メッセージ）
7. Pull Request を作成する（`gh pr create`）
8. 自己レビューを書く
9. 次の Issue を提案する

### Issue フォーマット

```
## Summary
このタスクの概要

## Goal
何を達成するか

## Tasks
- [ ] 実装内容1
- [ ] 実装内容2

## Acceptance Criteria
完了条件
```

### PR フォーマット

```
## Summary
このPRでやったこと

## Changes
変更内容

## Testing
テスト方法

## Related Issue
Closes #<number>
```

### ブランチ命名規則

```
feature/{issue-number}-{short-name}
例: feature/12-create-tasks-table
```

## コンテキスト圧縮時の保持事項

When compacting, always preserve:
- 変更・追加したファイルの一覧
- 未完了のタスクと次のステップ
- DBマイグレーションの適用状況
