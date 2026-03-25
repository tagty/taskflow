# auto-instinct-system 要件定義書

## 概要

ECC（Everything Claude Code）の instinct システムを参考に、Claude Code のセッション中の操作を自動記録・分析し、プロジェクト固有のパターン（instinct）ファイルを `.claude/instincts/` に蓄積する自動学習システム。使うほど賢くなる仕組みを実現し、既存の `diary-sync` フローとも連携する。

## 関連文書

- **ヒアリング記録**: [💬 interview-record.md](interview-record.md)
- **ユーザストーリー**: [📖 user-stories.md](user-stories.md)
- **受け入れ基準**: [✅ acceptance-criteria.md](acceptance-criteria.md)
- **コンテキストノート**: [📝 note.md](note.md)

## 機能要件（EARS記法）

**【信頼性レベル凡例】**:
- 🔵 **青信号**: ユーザヒアリング・既存実装から確実な要件
- 🟡 **黄信号**: 既存実装・ECC設計から妥当な推測
- 🔴 **赤信号**: 推測による要件

### セッションログ記録

- REQ-001: `PostToolUse` Hook が発火した場合、システムはツール名・入力サマリー・実行結果（成功/失敗）を `.claude/session-log.jsonl` に追記しなければならない 🔵 *ヒアリング: ツール使用・コマンド・エラー→修正パターンを記録対象と確認*
- REQ-002: セッションログには timestamp・tool_name・input_summary・outcome（success/error）・session_id を含まなければならない 🟡 *ECC instinct 設計から妥当な推測*
- REQ-003: ログの対象ツールは Bash・Edit・Write・Read・Glob・Grep とする 🟡 *ツール使用パターンの記録対象として妥当*

### instinct 自動生成（Stop hook）

- REQ-010: セッション終了時（Stop hook）に、システムは `.claude/session-log.jsonl` を AI で分析し、パターンを抽出しなければならない 🔵 *ヒアリング: Stop hook タイミングを確認*
- REQ-011: 抽出するパターンの種類は「ツール使用パターン」「コマンドパターン」「エラー→修正パターン」の3種とする 🔵 *ヒアリング: 記録対象として確認*
- REQ-012: 抽出されたパターンは `.claude/instincts/{pattern-slug}.md` として保存しなければならない 🔵 *ヒアリング: .claude/instincts/ を保存先と確認*
- REQ-013: instinct ファイルには confidence（low/medium/high）・occurrence_count・last_seen・pattern 説明を含まなければならない 🔵 *ヒアリング: 発生回数ベースで信頼度を管理と確認*
- REQ-014: セッション分析完了後、`.claude/session-log.jsonl` をリセット（空にする）しなければならない 🟡 *セッション間の重複記録を防ぐため*

### 信頼度管理（発生回数ベース）

- REQ-020: パターンの初回検出時、confidence を `low` として記録しなければならない 🔵 *ヒアリング: 発生回数ベース管理を確認*
- REQ-021: 同一パターンが2〜4回検出された場合、confidence を `medium` に昇格させなければならない 🔵 *ヒアリング: 複数回発生で medium→high に昇格を確認*
- REQ-022: 同一パターンが5回以上検出された場合、confidence を `high` に昇格させなければならない 🟡 *回数閾値は妥当な推測*
- REQ-023: パターンの同一性判定は AI が意味的類似度で判定し、既存の instinct ファイルを更新または新規作成を選択しなければならない 🟡 *ECC 設計から妥当な推測*

### diary-sync との連携

- REQ-030: `diary-sync` コマンドは `learnings.md` に加えて `.claude/instincts/` ディレクトリも分析対象に含めなければならない 🔵 *ヒアリング: instinct → diary-sync の入力に含めると確認*
- REQ-031: `diary-sync` は confidence `high` の instinct を CLAUDE.md 統合候補として優先提案しなければならない 🟡 *high 信頼度パターンのみ CLAUDE.md に昇格させるのが妥当*
- REQ-032: CLAUDE.md に統合済みの instinct ファイルには `promoted: true` フラグを付与しなければならない 🟡 *learnings.md の `[→ CLAUDE.md 統合済]` パターンに倣う*

### /evolve コマンド

- REQ-040: システムは `/evolve` コマンドを提供し、`.claude/instincts/` の一覧と信頼度を表示しなければならない 🟡 *ECC の /evolve 相当機能として妥当*
- REQ-041: `/evolve` はユーザーが手動で instinct の承認・削除・信頼度変更を行えるようにしなければならない 🟡 *ECC 設計から妥当な推測*

## 非機能要件

### パフォーマンス

- NFR-001: Stop hook での instinct 分析は30秒以内に完了しなければならない 🟡 *diary-on-stop.sh の既存動作から妥当な推測*
- NFR-002: PostToolUse でのセッションログ追記は100ms 以内でなければならない 🟡 *ツール実行をブロックしない速度が必要*

### セキュリティ

- NFR-010: `session-log.jsonl` には機密情報（APIキー・パスワード・環境変数の値）を含めてはならない 🔵 *既存の protect-files.sh の方針に準拠*
- NFR-011: instinct ファイルはプロジェクト固有であり、`.gitignore` に追加してはならない（バージョン管理対象） 🟡 *プロジェクト知識として共有する価値があるため*

### 堅牢性

- NFR-020: セッションログが空またはデータ不足の場合、instinct 生成をスキップして終了しなければならない 🔵 *diary-on-stop.sh の既存パターンに準拠*
- NFR-021: `claude -p` による分析が失敗した場合、エラーを無視してセッションを継続しなければならない（ノンブロッキング） 🔵 *Stop hook は本来の開発フローを妨げてはならない*

## Edge ケース

### エラー処理

- EDGE-001: `.claude/instincts/` ディレクトリが存在しない場合、自動作成しなければならない 🟡 *既存 hook スクリプトのパターンから妥当*
- EDGE-002: 同日に複数セッションが存在する場合、各セッションのログを累積して分析しなければならない 🟡 *diary-on-stop.sh の重複防止と異なり、instinct は累積型が妥当*

### 境界値

- EDGE-010: セッションログのサイズが大きい場合（1000行超）、直近500行のみを分析対象とする 🔴 *コスト・速度のトレードオフとして推測*
