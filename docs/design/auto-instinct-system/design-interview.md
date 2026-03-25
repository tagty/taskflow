# auto-instinct-system 設計ヒアリング記録

**作成日**: 2026-03-23
**ヒアリング実施**: step4 既存情報ベースの差分ヒアリング

## ヒアリング目的

要件定義書と既存の hooks 実装（diary-on-stop.sh, instinct-logger.sh 等）を参照し、設計上の不明点を明確化した。

## 質問と回答

### Q1: session-log.jsonl の記録粒度

**カテゴリ**: データモデル
**背景**: セッション単位（1ファイル=1セッション）か、ツール実行単位（1行=1ツール）かで分析の詳細度が変わる

**回答**: ツール単位（1行1エントリ）

**信頼性への影響**:
- `session-log.jsonl` のフォーマットが確定し、NFR-002（100ms 以内）の実現方針が明確化

---

### Q2: instinct パターンの同一性判定

**カテゴリ**: アーキテクチャ
**背景**: スラッグマッチング（単純・表記ゆれに弱い）vs AI 意味的類似度（精度高い・コストあり）

**回答**: AI に全任せ（claude -p が既存 instincts/ を読んで意味的類似度を判断）

**信頼性への影響**:
- `instinct-on-stop.sh` のプロンプト設計が確定
- 既存 instincts/ を claude -p に渡す設計が決定

---

### Q3: /evolve コマンドの実装方式

**カテゴリ**: 技術選択
**背景**: bash スクリプト（即時実行）vs Claude Code コマンド（ノンプログラミング管理 UI）

**回答**: Claude Code コマンド（`.claude/commands/evolve.md`）

**信頼性への影響**:
- `/evolve` の実装場所と形式が確定

---

### Q4: 既存実装の詳細分析要否

**カテゴリ**: 設計確認
**背景**: src/ 配下の TS コードは今回の実装に不要（全て bash + markdown）

**回答**: 不要（hooks/ と commands/ の既存パターンのみ参照）

**信頼性への影響**:
- TypeScript 型定義ファイル不要、DB スキーマ不要と確定

---

## ヒアリング結果サマリー

### 設計方針の決定事項
- session-log: ツール実行単位 JSONL（追記型）
- 同一性判定: AI（claude -p）による意味的類似度判定
- /evolve: `.claude/commands/evolve.md` として実装
- 型定義・DB スキーマは不要（ファイルベース設計）

### 残課題
- `session_id` の生成方法（`$PPID` や `$RANDOM` 等で代替）
- session-log のサイズ上限（500行）の実装詳細

### 信頼性レベル分布

**ヒアリング前**:
- 🔵 青信号: 4件
- 🟡 黄信号: 8件
- 🔴 赤信号: 3件

**ヒアリング後**:
- 🔵 青信号: 12件 (+8)
- 🟡 黄信号: 3件 (-5)
- 🔴 赤信号: 0件 (-3)

## 関連文書

- **アーキテクチャ設計**: [architecture.md](architecture.md)
- **データフロー**: [dataflow.md](dataflow.md)
- **ファイルフォーマット**: [file-formats.md](file-formats.md)
- **要件定義**: [requirements.md](../../spec/auto-instinct-system/requirements.md)
