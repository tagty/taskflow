#!/bin/bash
# PostToolUse hook: ツール使用をセッションログに記録する（auto-instinct-system）
# REQ-001, REQ-002, REQ-003, NFR-010

REPO_DIR="/Users/tetsuyataguchi/ghq/github.com/tagty/taskflow"
SESSION_LOG="${REPO_DIR}/.claude/session-log.jsonl"

# stdin から hook の入力を受け取る
INPUT=$(cat)

# ツール名を取得
TOOL_NAME=$(echo "${INPUT}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null)

# 対象ツール以外はスキップ（REQ-003）
case "${TOOL_NAME}" in
  Bash|Edit|Write|Read|Glob|Grep) ;;
  *) exit 0 ;;
esac

# input_summary を取得（最大200文字）
INPUT_SUMMARY=$(echo "${INPUT}" | python3 -c "
import sys, json, re

d = json.load(sys.stdin)
tool = d.get('tool_name', '')
inp = d.get('tool_input', {})

# ツールごとにサマリーを生成
if tool == 'Bash':
    summary = inp.get('command', '')[:200]
elif tool in ('Edit', 'Write'):
    summary = inp.get('file_path', '')
elif tool == 'Read':
    summary = inp.get('file_path', '')
elif tool == 'Glob':
    summary = inp.get('pattern', '')
elif tool == 'Grep':
    summary = inp.get('pattern', '') + ' in ' + inp.get('path', '.')
else:
    summary = str(inp)[:200]

# 機密情報マスキング（NFR-010）
patterns = [
    (r'(NEXT_PUBLIC_SUPABASE_URL=)\S+', r'\1[REDACTED]'),
    (r'(Bearer )\S+', r'\1[REDACTED]'),
    (r'(password=)\S+', r'\1[REDACTED]'),
    (r'(secret=)\S+', r'\1[REDACTED]'),
    (r'(key=)\S+', r'\1[REDACTED]'),
]
for pattern, replacement in patterns:
    summary = re.sub(pattern, replacement, summary, flags=re.IGNORECASE)

print(summary[:200])
" 2>/dev/null)

# outcome を取得
OUTCOME=$(echo "${INPUT}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
# tool_response があれば success、なければ判定
resp = d.get('tool_response', {})
if isinstance(resp, dict) and resp.get('is_error'):
    print('error')
else:
    print('success')
" 2>/dev/null)
OUTCOME="${OUTCOME:-success}"

# error_summary を取得（エラー時のみ、最大100文字）
ERROR_SUMMARY="null"
if [ "${OUTCOME}" = "error" ]; then
  ERR=$(echo "${INPUT}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
resp = d.get('tool_response', {})
msg = resp.get('content', '') if isinstance(resp, dict) else str(resp)
print(str(msg)[:100])
" 2>/dev/null)
  ERROR_SUMMARY="\"${ERR}\""
fi

# セッション ID（プロセス ID ベースの簡易 ID）
SESSION_ID="${$}"

# タイムスタンプ
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# JSONL に追記
mkdir -p "$(dirname "${SESSION_LOG}")"
printf '{"timestamp":"%s","tool":"%s","input_summary":"%s","outcome":"%s","error_summary":%s,"session_id":"%s"}\n' \
  "${TIMESTAMP}" \
  "${TOOL_NAME}" \
  "$(echo "${INPUT_SUMMARY}" | sed 's/"/\\"/g' | tr -d '\n')" \
  "${OUTCOME}" \
  "${ERROR_SUMMARY}" \
  "${SESSION_ID}" \
  >> "${SESSION_LOG}" 2>/dev/null

exit 0
