# auto-instinct-system 受け入れ基準

**作成日**: 2026-03-23
**関連要件定義**: [requirements.md](requirements.md)
**関連ユーザストーリー**: [user-stories.md](user-stories.md)
**ヒアリング記録**: [interview-record.md](interview-record.md)

---

## REQ-001: PostToolUse ログ追記 🔵

### Given
- Claude Code セッションが稼働中
- `.claude/settings.local.json` に PostToolUse hook が設定済み

### When
- Bash / Edit / Write / Read / Glob / Grep のいずれかのツールが実行される

### Then
- `.claude/session-log.jsonl` に1行 JSON が追記される
- JSON に `timestamp`, `tool_name`, `input_summary`, `outcome`, `session_id` が含まれる

### テストケース

#### 正常系
- [ ] **TC-001-01**: Bash ツール成功時にログ追記 🔵
  - **入力**: `Bash("git status")`
  - **期待結果**: `{"tool_name":"Bash","outcome":"success",...}` が追記される

- [ ] **TC-001-02**: Edit ツール実行後にログ追記 🔵
  - **入力**: `Edit(file_path, old, new)`
  - **期待結果**: `{"tool_name":"Edit","outcome":"success",...}` が追記される

#### 異常系
- [ ] **TC-001-E01**: Bash コマンド失敗時のログ 🔵
  - **入力**: `Bash("非存在コマンド")`
  - **期待結果**: `{"outcome":"error","error_summary":"..."}` が追記される

---

## REQ-010 / REQ-011 / REQ-012: instinct 自動生成 🔵

### Given
- Stop hook が発火した
- `.claude/session-log.jsonl` にデータが存在する

### When
- `instinct-on-stop.sh` が `claude -p` で session-log.jsonl を分析する

### Then
- `.claude/instincts/{pattern-slug}.md` が生成または更新される
- ツール使用パターン・コマンドパターン・エラー→修正パターンが抽出される
- 分析後 `session-log.jsonl` がリセットされる

### テストケース

#### 正常系
- [ ] **TC-010-01**: 新規パターン検出 🔵
  - **前提**: instincts/ に該当ファイルなし
  - **入力**: session-log.jsonl に Glob→Read→Edit の連鎖が記録されている
  - **期待結果**: `instincts/glob-read-edit-pattern.md` が confidence=low で生成される

- [ ] **TC-010-02**: 既存パターンの更新 🔵
  - **前提**: `instincts/glob-read-edit-pattern.md` が occurrence_count=2 で存在
  - **入力**: 同パターンを含む session-log.jsonl
  - **期待結果**: `occurrence_count=3`、confidence が medium に昇格

- [ ] **TC-010-03**: session-log.jsonl がリセットされる 🟡
  - **入力**: 分析完了後
  - **期待結果**: session-log.jsonl が空になる（または削除される）

#### 異常系
- [ ] **TC-010-E01**: session-log.jsonl が空の場合スキップ 🔵
  - **入力**: 空の session-log.jsonl
  - **期待結果**: instinct 生成をスキップしてノーマルに終了する

- [ ] **TC-010-E02**: claude -p が失敗した場合にノンブロッキング終了 🔵
  - **入力**: claude -p がタイムアウト/エラー
  - **期待結果**: スクリプトが exit 0 で終了し、セッション終了をブロックしない

---

## REQ-020〜022: 信頼度の自動昇格 🔵

### Given
- `.claude/instincts/{slug}.md` が存在する

### When
- 同一パターンが再度検出されて occurrence_count が更新される

### Then
- occurrence_count に応じて confidence が自動昇格する

### テストケース

#### 正常系
- [ ] **TC-020-01**: 初回 → low 🔵
  - **入力**: 新規パターン
  - **期待結果**: `confidence: low`, `occurrence_count: 1`

- [ ] **TC-020-02**: 2回目 → medium 昇格なし（2回で medium への条件確認） 🔵
  - **入力**: occurrence_count が 1→2 に更新
  - **期待結果**: `confidence: medium`, `occurrence_count: 2`

- [ ] **TC-020-03**: 5回目 → high 昇格 🔵
  - **入力**: occurrence_count が 4→5 に更新
  - **期待結果**: `confidence: high`, `occurrence_count: 5`

---

## REQ-030〜032: diary-sync との統合 🔵

### Given
- `.claude/instincts/` に confidence high のファイルが存在する
- ユーザーが `/diary-sync` を実行する

### When
- diary-sync コマンドが learnings.md と instincts/ を読み込む

### Then
- confidence high の instinct が CLAUDE.md 統合候補として提案される
- 承認後、該当 instinct ファイルに `promoted: true` が付与される

### テストケース

#### 正常系
- [ ] **TC-030-01**: confidence high が統合候補に含まれる 🔵
  - **入力**: `instincts/bash-git-pattern.md` (confidence: high)
  - **期待結果**: diary-sync の提案リストに含まれる

- [ ] **TC-030-02**: confidence low/medium は候補に含まれない 🟡
  - **入力**: `instincts/new-pattern.md` (confidence: low)
  - **期待結果**: 統合候補に含まれない（ノイズフィルタリング）

- [ ] **TC-030-03**: 統合後に promoted フラグ付与 🟡
  - **入力**: ユーザーが instinct を承認
  - **期待結果**: `promoted: true` が instinct ファイルに追記される

---

## 非機能要件テスト

### NFR-001: Stop hook 分析が30秒以内 🟡

- [ ] **TC-NFR-001-01**: 標準的なセッションログ（100行）の分析速度
  - **測定項目**: instinct-on-stop.sh の実行時間
  - **目標値**: 30秒以内
  - **測定条件**: 100行の session-log.jsonl

### NFR-002: PostToolUse ログ追記が100ms 以内 🟡

- [ ] **TC-NFR-002-01**: ツール実行をブロックしない
  - **測定項目**: hook スクリプトの実行時間
  - **目標値**: 100ms 以内

### NFR-020: session-log.jsonl が空でもスキップ 🔵

- [ ] **TC-NFR-020-01**: データなし時のグレースフル終了
  - **入力**: 空の session-log.jsonl
  - **期待結果**: exit 0 で終了、エラーなし

---

## テストケースサマリー

| カテゴリ | 正常系 | 異常系 | 合計 |
|---------|--------|--------|------|
| 機能要件 | 9件 | 5件 | 14件 |
| 非機能要件 | 3件 | 0件 | 3件 |
| **合計** | **12件** | **5件** | **17件** |

### 信頼性レベル分布

- 🔵 青信号: 13件 (76%)
- 🟡 黄信号: 4件 (24%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: 高品質
