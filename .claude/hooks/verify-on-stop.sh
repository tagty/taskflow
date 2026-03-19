#!/bin/bash
# Stop hook: コード変更があった場合に npm run verify を自動実行する

cd /Users/tetsuyataguchi/ghq/github.com/tagty/taskflow

# 変更ファイルがない場合はスキップ
if git diff --quiet && git diff --cached --quiet; then
  exit 0
fi

# src/ 以下の変更がある場合のみ verify
if git diff --name-only HEAD 2>/dev/null | grep -q '^src/'; then
  echo "🔍 変更を検出 — npm run verify を実行中..."
  npm run verify 2>&1
fi
