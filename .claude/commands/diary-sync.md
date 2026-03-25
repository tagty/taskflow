---
name: diary-sync
description: learnings.md と instincts/ を分析して CLAUDE.md に有益なパターンを統合する
---

`.claude/learnings.md` と `.claude/instincts/` に蓄積された知見を分析し、繰り返し現れるパターンを CLAUDE.md に統合してください。

## 手順

### 1. learnings.md を読み込む

`.claude/learnings.md` の全エントリを読み込み、以下の観点で分析する：

- **繰り返し成功したパターン** — 2回以上「うまくいった」に登場するもの
- **繰り返し失敗したパターン** — 2回以上「うまくいかなかった」に登場するもの
- **改善提案の収束** — 同じ改善が複数回記録されているもの

### 2. instincts/ を読み込む（auto-instinct-system）

`.claude/instincts/*.md` が存在する場合は全件読み込み、confidence 別にフィルタリングする：

- **confidence: high** → CLAUDE.md 統合候補として**優先提案**する（REQ-031）
- **confidence: medium** → 参考情報として表示する（統合候補には含めない）
- **confidence: low** → 表示しない（ノイズフィルタ）

### 3. CLAUDE.md の更新提案を作成する

分析結果をもとに、CLAUDE.md に追加すべきルール・注意事項・ベストプラクティスを提案する。

提案フォーマット：
```
【追加候補】
- セクション: <追加先セクション名>
- 内容: <追加するルールや知見>
- 根拠: <learnings.md の該当エントリ（日付）または instinct slug>
- 信頼度: <high / medium（learnings.md 由来）>
```

高信頼度（confidence: high）の instinct を最初に提案し、learnings.md 由来の提案を後に続ける。

### 4. ユーザーに確認して CLAUDE.md を更新する

提案内容をユーザーに提示し、承認を得てから CLAUDE.md を編集する。

- 既存のルールと重複しないか確認する
- CLAUDE.md は短く保つ（自明なことは追加しない）
- learnings.md 由来の追加後は対象エントリに `[→ CLAUDE.md 統合済]` と追記する
- instinct 由来の追加後は該当 instinct ファイルの frontmatter に `promoted: true` を付与する（REQ-032）
