#!/bin/bash
# Stop hook: セッション終了時に instinct を自動生成・更新する（auto-instinct-system）
# REQ-010, REQ-011, REQ-012, REQ-013, REQ-014, NFR-020, NFR-021

REPO_DIR="/Users/tetsuyataguchi/ghq/github.com/tagty/taskflow"
LOG_FILE="${REPO_DIR}/.claude/session-log.jsonl"
INSTINCTS_DIR="${REPO_DIR}/.claude/instincts"
TODAY=$(date +%Y-%m-%d)

# session-log.jsonl が空またはなければスキップ（NFR-020）
if [ ! -f "${LOG_FILE}" ] || [ ! -s "${LOG_FILE}" ]; then
  exit 0
fi

# instincts/ ディレクトリの自動作成（EDGE-001）
mkdir -p "${INSTINCTS_DIR}"

# ログのサイズ制限: 1000行超なら直近500行のみ（EDGE-010）
LINE_COUNT=$(wc -l < "${LOG_FILE}")
if [ "${LINE_COUNT}" -gt 1000 ]; then
  SESSION_LOG=$(tail -500 "${LOG_FILE}")
else
  SESSION_LOG=$(cat "${LOG_FILE}")
fi

# 既存 instinct ファイルの内容を取得（REQ-023）
EXISTING_INSTINCTS=""
if ls "${INSTINCTS_DIR}"/*.md 2>/dev/null | head -1 > /dev/null 2>&1; then
  EXISTING_INSTINCTS=$(cat "${INSTINCTS_DIR}"/*.md 2>/dev/null)
fi

# claude -p で AI 分析（NFR-021: 失敗してもノンブロッキング）
timeout 30 claude -p "
以下のセッションログを分析して、プロジェクト固有のパターンを抽出してください。

## セッションログ
${SESSION_LOG}

## 既存の instinct ファイル一覧
${EXISTING_INSTINCTS}

## 抽出するパターン種別
1. ツール使用パターン: ツールの連鎖順序（例: Glob→Read→Edit）
2. コマンドパターン: 繰り返し実行されるbashコマンドの組み合わせ
3. エラー→修正パターン: エラー発生→修正成功の連鎖

## instinct ファイルのフォーマット
\`\`\`yaml
---
slug: {pattern-slug}
title: {短い説明}
type: tool-usage | command | error-fix
confidence: low | medium | high
occurrence_count: {数値}
last_seen: ${TODAY}
promoted: false
---

## パターン説明
{説明}

## 観測例
{例}

## 示唆
{示唆}
\`\`\`

## 出力ルール
- 既存 instinct と意味的に類似するパターンは、そのファイルを更新する（occurrence_count++ と last_seen を ${TODAY} に更新）
- confidence は occurrence_count に基づいて設定: 1→low, 2〜4→medium, 5以上→high
- 新規パターンは confidence: low で新しいファイルを作成する
- 意味のない1回限りの操作はパターンとして記録しない
- 各ファイルは ${INSTINCTS_DIR}/{slug}.md に保存する

ファイルを更新・作成してください。
" --allowedTools "Read,Edit,Write" 2>/dev/null

# session-log.jsonl をリセット（REQ-014）
> "${LOG_FILE}"

echo "✨ instinct-on-stop: instincts を更新しました"
exit 0
