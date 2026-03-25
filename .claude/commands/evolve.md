---
name: evolve
description: .claude/instincts/ の一覧を confidence 別に表示し、instinct の管理（削除・信頼度変更・内容確認）を行う
---

`.claude/instincts/` に蓄積された instinct を管理してください。

## 手順

### 1. instinct ファイルを読み込む

`.claude/instincts/*.md` を全件読み込む。ファイルが存在しない場合は「まだ instinct が蓄積されていません。セッションを重ねると自動的に生成されます。」と表示して終了する。

### 2. confidence 別に一覧表示する

frontmatter の `confidence` フィールドでグループ化して表示する：

```
## 🟢 high（CLAUDE.md 統合候補）
- [slug] (count: N, 最終更新: YYYY-MM-DD) — title

## 🟡 medium（蓄積中）
- [slug] (count: N, 最終更新: YYYY-MM-DD) — title

## ⚪ low（初回検出）
- [slug] (count: N, 最終更新: YYYY-MM-DD) — title

合計: N 件
```

また `promoted: true` のファイルには `[統合済]` バッジを表示する。

### 3. 操作メニューを提示する

```
操作を選んでください：
1. [slug名] の内容を確認する
2. [slug名] を削除する
3. [slug名] の confidence を変更する
4. 終了
```

### 4. 操作を実行する

**内容確認**: 指定した instinct ファイルの全文を表示する。

**削除**: 削除前に「本当に削除しますか？この操作は取り消せません。」と確認する。承認後に該当ファイルを削除する。

**confidence 変更**: 指定した instinct ファイルの frontmatter の `confidence` を `low` / `medium` / `high` のいずれかに変更する。`occurrence_count` は変更しない。

### 5. 操作後の状態を表示する

変更後の instinct 一覧を再表示するか確認し、必要に応じて手順 2 に戻る。
