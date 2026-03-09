#!/bin/bash
# lint エラーを自律的に一括修正する（安全な自律モード）
# --dangerously-skip-permissions を使うが、allowedTools でスコープを限定
# 使い方: ./scripts/fix-lint.sh

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "=== lint エラーを確認 ==="
LINT_OUTPUT=$(npm run lint --silent 2>&1 || true)

if [ -z "$LINT_OUTPUT" ]; then
  echo "lint エラーなし。終了します。"
  exit 0
fi

echo "$LINT_OUTPUT"
ERROR_COUNT=$(echo "$LINT_OUTPUT" | grep -c "error" || true)
echo ""
echo "エラー数: $ERROR_COUNT"
echo ""

read -p "Claude に自律修正させますか？ [y/N] " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "キャンセルしました"
  exit 0
fi

echo ""
echo "=== 自律修正開始 ==="
echo "（--allowedTools で Edit のみに制限。ネットワーク・Bash は使用不可）"
echo ""

claude -p "以下の lint エラーを修正してください。
エラーメッセージを読んで、該当ファイルを修正してください。
修正後に lint を実行して全エラーが解消されたか確認してください。

lint エラー:
$LINT_OUTPUT" \
  --dangerously-skip-permissions \
  --allowedTools "Read,Edit,Bash(npm run lint:*)" \
  2>&1

echo ""
echo "=== 修正後の lint チェック ==="
npm run lint --silent 2>&1 && echo "✓ lint エラーなし" || echo "❌ まだエラーが残っています"
