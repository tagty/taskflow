#!/bin/bash
# PreToolUse: .env.local への書き込みをブロック

TOOL_INPUT="$CLAUDE_TOOL_INPUT"

if echo "$TOOL_INPUT" | grep -q '\.env\.local'; then
  echo '{"decision":"block","reason":".env.local への直接書き込みはブロックされています。環境変数を変更する場合は手動で編集してください。"}'
  exit 2
fi
