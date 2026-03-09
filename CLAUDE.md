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
node scripts/record-pr-demo.js {PR番号} {PROJECT_ID}  # デモ GIF 生成
```

## アーキテクチャ

- **フレームワーク**: Next.js App Router + TypeScript
- **DB**: Supabase (PostgreSQL) — `src/lib/supabase/queries.ts` にクエリを集約
- **スタイル**: Tailwind CSS（ダークモード `dark:` 対応必須）
- **サーバーアクション**: 各ページの `actions.ts`（`"use server"` 必須）

## データモデル

- `projects` — id, name, color, description
- `tasks` — id, project_id, title, status(`todo`/`doing`/`done`), due_date, scheduled_for, completed_at, tags
- `task_notes` — id, task_id, body

## 開発ルール

- `supabaseAdmin`（secret key）はサーバー側のみ。クライアントでは `supabase`（publishable key）
- DBスキーマ変更は `npx supabase migration new <name>` でマイグレーションファイルを作成
- 新機能実装は `/implement-feature` スキルに従う。パターンは `/code-patterns` を参照
- チェックポイント（`/rewind`）は git の代替ではない。節目ごとに git commit する

## 開発フロー（GitHub Issue ベース）

Claude は PM・Engineer・Reviewer として自走する。**必ず1タスクずつ進める。**

```
Issue 作成 → Branch → 実装 → verify → Commit → PR → スクリーンショット/GIF → レビュー → 次の Issue 提案
```

### 手順

1. `spec/features/` または Todo からタスクを選ぶ
2. `gh issue create` で Issue を作成する
3. `feature/{issue-number}-{short-name}` ブランチを作る
4. 実装する
5. `npm run verify` で検証（必須）
6. 日本語メッセージで Commit する
7. `gh pr create` で PR を作成する
8. UI変更があればスクリーンショット・GIF を撮影して PR に追加する
9. 自己レビューを書く
10. 次の Issue を提案する

### Issue フォーマット

```markdown
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

```markdown
## Summary
このPRでやったこと

## Changes
変更内容

## Testing
テスト方法

## Demo
![demo](https://tagty.github.io/taskflow/pr-{PR_NUMBER}/demo.gif)

## Screenshots

### 画面名
![](https://tagty.github.io/taskflow/pr-{PR_NUMBER}/screen.png)

## Related Issue
Closes #<number>
```

### ブランチ命名規則

```
feature/{issue-number}-{short-name}
例: feature/12-create-tasks-table
```

## PR スクリーンショット・GIF ワークフロー

UI変更を含む PR では必ずビジュアルを生成し PR 本文に表示する。

### スクリーンショット（静止画）

```bash
npm run dev &
npx playwright screenshot --browser chromium --viewport-size "1440,900" --full-page \
  http://localhost:3000/<path> screenshots/pr-{PR_NUMBER}/<name>.png
```

### デモ GIF（操作動画）

```bash
npm run dev &
node scripts/record-pr-demo.js {PR_NUMBER} {PROJECT_ID}
# → screenshots/pr-{PR_NUMBER}/demo.gif が生成される
```

### gh-pages へのデプロイ

```bash
git stash
git checkout gh-pages
cp screenshots/pr-{PR_NUMBER}/* pr-{PR_NUMBER}/
git add pr-{PR_NUMBER}/
git commit -m "PR #{PR_NUMBER} ビジュアルを追加"
git push origin gh-pages
git checkout -
git stash pop
```

### ルール

- UI変更がある場合は必ずスクリーンショットを更新する
- フルページ・画面幅 1440px 固定
- GIF は `ffmpeg` で webm から変換（fps=10、パレット最適化）
- GitHub Pages URL: `https://tagty.github.io/taskflow/pr-{PR_NUMBER}/`

## コンテキスト圧縮時の保持事項

When compacting, always preserve:
- 変更・追加したファイルの一覧
- 未完了のタスクと次のステップ
- DBマイグレーションの適用状況
