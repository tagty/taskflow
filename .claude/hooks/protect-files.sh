#!/bin/bash
# PreToolUse: 機密ファイルへの書き込みをブロック

TOOL_INPUT="$CLAUDE_TOOL_INPUT"

if echo "$TOOL_INPUT" | grep -qE '\.env(\.[a-zA-Z0-9._-]+)?[^a-zA-Z0-9._-]|\.env$'; then
  echo '{"decision":"block","reason":".env* ファイルへの直接書き込みはブロックされています。環境変数を変更する場合は手動で編集してください。"}'
  exit 2
fi
