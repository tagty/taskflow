---
name: implement-feature
description: 新機能を探索→計画→実装の順で安全に実装する
disable-model-invocation: true
---

以下のステップで "$ARGUMENTS" を実装してください。

## Step 1: 探索（変更しない）

**サブエージェントを使って調査し、メインのコンテキストを節約する：**

- DB 構造が関わる場合 → `db-explorer サブエージェントを使って DB 構造と既存クエリを調査して`
- 広範なコード調査が必要な場合 → `サブエージェントを使って [調査対象] を調査して、要約を報告して`

調査結果を受け取ったら：
- `/code-patterns` スキルを参照してパターンを確認する
- 仕様書がある場合は `spec/features/$ARGUMENTS.md` を読む

## Step 2: 計画

以下を明示する：
- 変更・追加するファイルの一覧
- DBマイグレーションが必要かどうか
- 実装方針（既存パターンとの整合性）

## Step 3: 実装

計画に沿って実装する。

## Step 4: 検証

```bash
npm run verify
```

UIを変更した場合はさらに：
```bash
npm run test:e2e:update
npm run test:e2e
```

## Step 5: コードレビュー

サブエージェントを使ってレビューを依頼する：

> 「code-reviewer サブエージェントを使って、今回実装したコードをレビューして」

指摘があれば修正し、問題なければ次のステップへ。

## Step 6: コミット

日本語で説明的なコミットメッセージを作成してコミット。

---

**並列セッションで品質を上げたい場合（Writer/Reviewer パターン）：**

```bash
# 別ターミナルで新しい worktree + Claude セッションを起動
./scripts/new-worktree.sh feature/<機能名>
# → 新しい Claude セッションで「このPR差分をレビューして」と依頼
```
