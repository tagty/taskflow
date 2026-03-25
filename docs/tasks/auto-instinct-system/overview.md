# auto-instinct-system タスク概要

**作成日**: 2026-03-24
**推定工数**: 18時間
**総タスク数**: 6件

## 関連文書

- **要件定義書**: [📋 requirements.md](../spec/auto-instinct-system/requirements.md)
- **設計文書**: [📐 architecture.md](../design/auto-instinct-system/architecture.md)
- **ファイルフォーマット**: [📝 file-formats.md](../design/auto-instinct-system/file-formats.md)
- **データフロー図**: [🔄 dataflow.md](../design/auto-instinct-system/dataflow.md)

## フェーズ構成

| フェーズ | 成果物 | タスク数 | 工数 |
|---------|--------|----------|------|
| Phase 1 - 環境基盤 | hooks 設定・ディレクトリ初期化 | 2 | 3h |
| Phase 2 - コア実装 | instinct-logger.sh・instinct-on-stop.sh | 2 | 10h |
| Phase 3 - コマンド実装 | evolve.md・diary-sync.md拡張 | 2 | 5h |

## タスク番号管理

**使用済みタスク番号**: TASK-0001 ~ TASK-0006
**次回開始番号**: TASK-0007

## 全体進捗

- [ ] Phase 1: 環境基盤
- [ ] Phase 2: コア実装
- [ ] Phase 3: コマンド実装

## マイルストーン

- **M1: 環境基盤完成**: hook 設定・ディレクトリ初期化完了
- **M2: 自動記録動作**: instinct-logger.sh が session-log.jsonl に追記できる状態
- **M3: 自動分析動作**: instinct-on-stop.sh がセッション終了時に instinct を生成できる状態
- **M4: 完全統合**: /evolve・/diary-sync 連携まで含めた全機能が動作

---

## Phase 1: 環境基盤

**目標**: hook 設定と必要なディレクトリ・ファイルを用意する
**成果物**: 更新された settings.local.json、.claude/instincts/ ディレクトリ、session-log.jsonl

### タスク一覧

- [ ] [TASK-0001: hook設定ファイル更新](TASK-0001.md) - 2h (DIRECT) 🔵
- [ ] [TASK-0002: ディレクトリ・初期ファイル作成](TASK-0002.md) - 1h (DIRECT) 🔵

### 依存関係

```
TASK-0001 → TASK-0002
```

---

## Phase 2: コア実装

**目標**: セッションログの自動記録と、セッション終了時の instinct 自動生成を実装する
**成果物**: instinct-logger.sh、instinct-on-stop.sh

### タスク一覧

- [ ] [TASK-0003: instinct-logger.sh実装](TASK-0003.md) - 4h (DIRECT) 🔵
- [ ] [TASK-0004: instinct-on-stop.sh実装](TASK-0004.md) - 6h (DIRECT) 🔵

### 依存関係

```
TASK-0002 → TASK-0003 → TASK-0004
```

---

## Phase 3: コマンド実装

**目標**: /evolve コマンドと /diary-sync の拡張により、instinct の管理・昇格フローを完成させる
**成果物**: .claude/commands/evolve.md、更新された .claude/commands/diary-sync.md

### タスク一覧

- [ ] [TASK-0005: evolve.mdコマンド実装](TASK-0005.md) - 3h (DIRECT) 🟡
- [ ] [TASK-0006: diary-sync.md拡張](TASK-0006.md) - 2h (DIRECT) 🔵

### 依存関係

```
TASK-0004 → TASK-0005
TASK-0004 → TASK-0006
```

---

## 信頼性レベルサマリー

| フェーズ | 🔵 青 | 🟡 黄 | 🔴 赤 | 合計 |
|---------|-------|-------|-------|------|
| Phase 1 | 2 | 0 | 0 | 2 |
| Phase 2 | 2 | 0 | 0 | 2 |
| Phase 3 | 1 | 1 | 0 | 2 |
| **合計** | **5** | **1** | **0** | **6** |

**品質評価**: ✅ 高品質（全体の83%が青信号）

## クリティカルパス

```
TASK-0001 → TASK-0002 → TASK-0003 → TASK-0004 → TASK-0005
                                               → TASK-0006
```

**クリティカルパス工数**: 13時間（TASK-0001〜0004の直列部分）

## 次のステップ

- 全タスク順番に実装: `/kairo-implement`
- 特定タスクを実装: `/kairo-implement TASK-0001`
