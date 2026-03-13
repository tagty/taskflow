# Architecture Decision Records

このディレクトリはプロジェクトの設計決定を記録する ADR（Architecture Decision Records）を管理します。

## 一覧

| # | タイトル | ステータス |
|---|---|---|
| [0001](./0001-supabase-client-separation.md) | Supabase クライアントをサーバー/クライアントで分離する | 採用済み |
| [0002](./0002-query-centralization.md) | クエリを queries.ts に集約する | 採用済み |
| [0003](./0003-task-status-cycle.md) | タスクステータスを todo → doing → done → todo のサイクルにする | 採用済み |

## ADR の追加方法

新しい設計決定をした際は以下のテンプレートで追加してください。

```markdown
# ADR XXXX: タイトル

## ステータス
提案 / 採用済み / 廃止

## 背景
なぜこの決定が必要だったか

## 決定
何を決めたか

## 理由
なぜその決定をしたか

## 影響
この決定による制約・注意点
```
