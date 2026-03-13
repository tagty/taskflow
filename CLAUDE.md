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

### 小〜中規模（通常）

Issue → `feature/{issue-number}-{name}` ブランチ → 実装 → `/self-review` → `npm run verify` → commit（日本語） → PR → スクリーンショット/GIF → 次の Issue 提案

### 中〜大規模（tsumiki を使う）

Issue → ブランチ → `/kairo-requirements` → `/kairo-design` → `/kairo-tasks` → `/kairo-implement` → `/self-review` → `npm run verify` → commit → PR → スクリーンショット/GIF

| スキル | タイミング | 目的 |
|---|---|---|
| `/kairo-requirements` | 実装前 | 要件を EARS 記法で整理 |
| `/kairo-design` | 要件確定後 | 設計文書・DB スキーマ生成 |
| `/kairo-tasks` | 設計確定後 | タスクを1日単位に分割 |
| `/kairo-implement` | 実装中 | TDD（red→green→refactor）で実装 |
| `/self-review` | PR 作成前 | 規約・品質・要件の自動チェック |

- PR には `## Demo` と `## Screenshots` セクションを必ず追加（`/pr-screenshot` スキルを参照）
- Issue・PR のフォーマットは `/github-workflow` スキルを参照

## コンテキスト圧縮時の保持事項

When compacting, always preserve:
- 変更・追加したファイルの一覧
- 未完了のタスクと次のステップ
- DBマイグレーションの適用状況
