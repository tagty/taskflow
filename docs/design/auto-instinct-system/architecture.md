# auto-instinct-system アーキテクチャ設計

**作成日**: 2026-03-23
**関連要件定義**: [requirements.md](../../spec/auto-instinct-system/requirements.md)
**ヒアリング記録**: [design-interview.md](design-interview.md)

**【信頼性レベル凡例】**:
- 🔵 確実な設計（ヒアリング確認済み）
- 🟡 妥当な推測による設計
- 🔴 推測による設計

---

## システム概要 🔵

Claude Code のセッション操作を Hooks で自動記録し、セッション終了時に AI が分析してプロジェクト固有のパターン（instinct）ファイルを `.claude/instincts/` に蓄積する。既存の `diary-sync` フローを拡張し、高信頼度パターンを CLAUDE.md に昇格させる。

**Web/DB は不要。すべてファイルベースで動作する。**

## アーキテクチャパターン 🔵

**信頼性**: 🔵 *既存 hooks 設計・CLAUDE.md より*

- **パターン**: Event-driven（Claude Code Hooks）+ File-based Storage
- **選択理由**: 既存の `diary-on-stop.sh` と同じパターンで一貫性を保つ。Supabase 等の外部サービス不要

## コンポーネント構成 🔵

**信頼性**: 🔵 *ヒアリング確認済み*

```
新規追加コンポーネント:
├── .claude/hooks/instinct-logger.sh    # PostToolUse hook（ログ追記）
├── .claude/hooks/instinct-on-stop.sh  # Stop hook（分析・instinct生成）
├── .claude/commands/evolve.md         # /evolve コマンド（管理UI）
├── .claude/instincts/                 # instinct ファイル格納ディレクトリ
│   └── {slug}.md                     # 各パターンファイル
└── .claude/session-log.jsonl          # セッションログ（一時ファイル）

変更コンポーネント:
└── .claude/commands/diary-sync.md     # instincts/ を追加入力として読み込む
```

## システム構成図 🔵

**信頼性**: 🔵 *設計ヒアリング・既存 hooks 構成より*

```
[Claude Code セッション]
      │
      ├──[ツール実行]──► PostToolUse Hook
      │                        │
      │                   instinct-logger.sh
      │                        │
      │                   session-log.jsonl（追記）
      │
      └──[セッション終了]──► Stop Hook
                               │
                    ┌──────────┴──────────┐
                    │                     │
             verify-on-stop.sh    instinct-on-stop.sh
                                          │
                                   session-log.jsonl（読み込み）
                                          │
                                   claude -p（AI分析）
                                          │
                               .claude/instincts/{slug}.md
                               （新規作成 or 更新）
                                          │
                                   session-log.jsonl（リセット）

[/diary-sync 実行時]
      │
      ├── learnings.md（既存）
      └── instincts/*.md（新規追加）
              │
         claude -p（統合分析）
              │
         CLAUDE.md 更新候補の提案
```

## 各コンポーネントの責務

### instinct-logger.sh 🔵

**信頼性**: 🔵 *REQ-001〜003・ヒアリング確認済み*

- **トリガー**: PostToolUse（Bash / Edit / Write / Read / Glob / Grep）
- **処理**: ツール名・入力サマリー・実行結果を `.claude/session-log.jsonl` に1行追記
- **制約**: 100ms 以内で完了（NFR-002）。機密情報はマスキング

### instinct-on-stop.sh 🔵

**信頼性**: 🔵 *REQ-010〜014・ヒアリング確認済み*

- **トリガー**: Stop hook（diary-on-stop.sh と同タイミング）
- **処理**:
  1. `session-log.jsonl` が空ならスキップ
  2. `instincts/*.md` の一覧を読み込む（既存パターンとの比較用）
  3. `claude -p` で session-log.jsonl を分析 → 3種のパターン抽出
  4. AI が既存 instinct との意味的類似度を判断し、新規作成 or 更新を選択
  5. `session-log.jsonl` をリセット

### instinct ファイル (.claude/instincts/{slug}.md) 🔵

**信頼性**: 🔵 *REQ-012〜013・ヒアリング確認済み*

YAML frontmatter + 本文のマークダウンファイル（フォーマットは `file-formats.md` 参照）

### evolve.md コマンド 🟡

**信頼性**: 🟡 *REQ-040〜041・ECC 設計から妥当な推測*

- **実装**: `.claude/commands/evolve.md`（Claude Code コマンド）
- **機能**: instincts/ 一覧表示、信頼度フィルタリング、削除・承認操作

### diary-sync.md（変更） 🔵

**信頼性**: 🔵 *REQ-030〜032・ヒアリング確認済み*

- **変更内容**: `learnings.md` に加えて `instincts/*.md` も読み込む手順を追加
- **追加ロジック**: confidence `high` のファイルを CLAUDE.md 統合候補として優先提案

## 技術的制約 🔵

**信頼性**: 🔵 *CLAUDE.md・既存 hooks より*

- `claude -p` の呼び出しは `--allowedTools "Read,Edit,Write"` で権限を最小化
- Stop hook はノンブロッキング（分析失敗しても exit 0）
- `session-log.jsonl` には APIキー・パスワード等の機密情報を含めない
- `instincts/` はバージョン管理対象（`.gitignore` に追加しない）

## 非機能要件の実現方法

### パフォーマンス 🟡

**信頼性**: 🟡 *NFR-001〜002 から妥当な推測*

- instinct-logger.sh: ファイル追記のみ（I/O のみ）→ 100ms 以内は容易
- instinct-on-stop.sh: session-log.jsonl が大きい場合は直近500行に限定して `claude -p` に渡す

### セキュリティ 🔵

**信頼性**: 🔵 *NFR-010〜011・protect-files.sh 既存設計より*

- instinct-logger.sh は入力のマスキング処理でパスワード・APIキーパターンを除去
- `--allowedTools "Read,Edit,Write"` で claude -p の権限を最小化

### 堅牢性 🔵

**信頼性**: 🔵 *NFR-020〜021・diary-on-stop.sh パターンより*

- session-log.jsonl が空 → スキップして exit 0
- claude -p 失敗 → エラーを無視して exit 0
- instincts/ ディレクトリが未存在 → `mkdir -p` で自動作成

## 信頼性レベルサマリー

- 🔵 青信号: 12件 (80%)
- 🟡 黄信号: 3件 (20%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: ✅ 高品質
