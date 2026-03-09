#!/bin/bash
# TaskCompleted hook: タスク完了前にテストが通っているか確認する

TASK_INPUT="$CLAUDE_TOOL_INPUT"
TASK_TITLE=$(echo "$TASK_INPUT" | grep -o '"title":"[^"]*"' | head -1 | sed 's/"title":"//;s/"//')

# 実装タスク（コード変更を伴う）の場合のみチェック
if echo "$TASK_TITLE" | grep -qiE 'implement|add|fix|update|create|refactor'; then
  # lint が通っているか確認
  cd /Users/tetsuyataguchi/ghq/github.com/tagty/taskflow
  if ! npm run lint --silent 2>/dev/null; then
    echo '{"decision":"block","reason":"タスク完了前に lint エラーを修正してください。npm run lint を実行して確認してください。"}'
    exit 2
  fi
fi
