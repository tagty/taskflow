# auto-instinct-system ファイルフォーマット仕様

**作成日**: 2026-03-23
**関連設計**: [architecture.md](architecture.md)

---

## session-log.jsonl 🔵

**信頼性**: 🔵 *REQ-002・ヒアリング確認済み*

**パス**: `.claude/session-log.jsonl`
**形式**: JSON Lines（1行1エントリ）
**ライフサイクル**: セッション中に追記、Stop hook で分析後リセット

### 各行のスキーマ

```jsonc
{
  "timestamp": "2026-03-23T10:00:00Z",  // ISO8601 UTC
  "tool": "Bash",                        // Bash | Edit | Write | Read | Glob | Grep
  "input_summary": "git log --oneline",  // 最大200文字、機密情報マスク済み
  "outcome": "success",                  // success | error
  "error_summary": null,                 // エラー時のみ。最大100文字
  "session_id": "abc123"                 // セッション識別子（任意）
}
```

### 機密情報のマスキングルール 🔵

**信頼性**: 🔵 *NFR-010 より*

以下のパターンにマッチする値は `[REDACTED]` に置換する:
- 環境変数の値（`NEXT_PUBLIC_SUPABASE_URL=` 以降など）
- `Bearer ` 以降のトークン文字列
- `password=` `secret=` `key=` 以降の値

---

## instinct ファイル (.claude/instincts/{slug}.md) 🔵

**信頼性**: 🔵 *REQ-012〜013・ヒアリング確認済み*

**パス**: `.claude/instincts/{pattern-slug}.md`
**形式**: YAML frontmatter + Markdown 本文

### スキーマ

```yaml
---
slug: glob-read-edit-pattern         # ケバブケース識別子
title: Glob → Read → Edit の連鎖     # 短い説明
type: tool-usage                      # tool-usage | command | error-fix
confidence: medium                    # low | medium | high
occurrence_count: 3                   # 検出回数
last_seen: 2026-03-23                 # 最終検出日（YYYY-MM-DD）
promoted: false                       # diary-sync で CLAUDE.md 統合済みか
---

## パターン説明

ファイルを調査する際に Glob で一覧取得 → Read で内容確認 → Edit で変更、という
3ステップの連鎖が頻繁に観察される。

## 観測例

```
Glob("src/**/*.ts") → Read("src/lib/queries.ts") → Edit("src/lib/queries.ts")
```

## 示唆

このパターンは「対象ファイルの特定 → 内容把握 → 変更」という標準的な調査・編集フロー。
Read を省略して直接 Edit すると意図しない変更のリスクがある。
```

### slug の命名規則 🟡

**信頼性**: 🟡 *ECC 設計から妥当な推測*

- ケバブケース（kebab-case）
- パターンの主要な要素を含める
- 最大50文字
- 例: `glob-read-edit-pattern`, `npm-run-verify-habit`, `lint-error-fix-cycle`

### type の種別 🔵

**信頼性**: 🔵 *REQ-011・ヒアリング確認済み*

| type | 説明 | 例 |
|------|------|----|
| `tool-usage` | ツール使用の順序パターン | Glob → Read → Edit |
| `command` | よく実行するコマンドパターン | `npm run verify` → commit |
| `error-fix` | エラー→修正の連鎖パターン | lint error → Edit → lint success |

---

## instinct-on-stop.sh への AI プロンプト仕様 🔵

**信頼性**: 🔵 *REQ-010・diary-on-stop.sh パターンより*

```bash
claude -p "
以下のセッションログを分析して、プロジェクト固有のパターンを抽出してください。

## セッションログ
${SESSION_LOG}

## 既存の instinct ファイル一覧
${EXISTING_INSTINCTS}

## 抽出するパターン種別
1. ツール使用パターン: ツールの連鎖順序（例: Glob→Read→Edit）
2. コマンドパターン: 繰り返し実行されるbashコマンドの組み合わせ
3. エラー→修正パターン: エラー発生→修正成功の連鎖

## 出力ルール
- 既存 instinct と意味的に類似するパターンは、そのファイルを更新する（occurrence_count++ と last_seen 更新）
- 新規パターンは confidence: low で新しいファイルを作成する
- 意味のない1回限りの操作はパターンとして記録しない
- 各ファイルは ${INSTINCTS_DIR}/{slug}.md に保存する

ファイルを更新・作成してください。
" --allowedTools "Read,Edit,Write" 2>/dev/null
```

---

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **データフロー**: [dataflow.md](dataflow.md)
