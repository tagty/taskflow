---
name: fix-issue
description: GitHub Issue を確認して修正する
disable-model-invocation: true
---

以下のステップで GitHub Issue "$ARGUMENTS" を修正してください。

1. `gh issue view $ARGUMENTS` で Issue の詳細を確認する
2. 問題の内容を理解する
3. 関連ファイルをコードベースから探す
4. 必要な変更を実装する
5. テストを書いて実行し、修正を検証する
6. lint・型チェックが通ることを確認する（`npm run verify`）
7. 説明的なコミットメッセージを日本語で作成してコミット
8. `gh pr create` で PR を作成する
