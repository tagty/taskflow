#!/bin/bash
# 全コンポーネントのダークモード対応を claude -p でチェックする
# 使い方: ./scripts/check-dark-mode.sh

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
FILES=$(find "$REPO_ROOT/src" -name "*.tsx" | sort)

echo "=== ダークモード対応チェック ==="
echo "対象: $(echo "$FILES" | wc -l | tr -d ' ') ファイル"
echo ""

FAIL_COUNT=0
PASS_COUNT=0

for file in $FILES; do
  rel=$(realpath --relative-to="$REPO_ROOT" "$file")

  result=$(claude -p "このファイルに Tailwind の色クラス（bg-*, text-*, border-* など）が使われている場合、対応する dark: プレフィックスがあるか確認してください。
問題があれば「FAIL: [理由]」、問題なければ「OK」のみ返してください。

ファイル: $rel" \
    --allowedTools "Read" \
    --output-format text \
    2>/dev/null)

  if echo "$result" | grep -q "^FAIL"; then
    echo "❌ $rel"
    echo "   $result"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
done

echo ""
echo "=== 結果 ==="
echo "OK: $PASS_COUNT / FAIL: $FAIL_COUNT"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
