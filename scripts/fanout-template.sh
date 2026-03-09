#!/bin/bash
# ファンアウトバッチ処理テンプレート
# 使い方: PROMPT="..." GLOB="src/**/*.ts" ./scripts/fanout-template.sh
#
# 例:
#   PROMPT="この関数にJSDocコメントを追加して" GLOB="src/lib/**/*.ts" ./scripts/fanout-template.sh
#   PROMPT="エラーハンドリングを追加して" GLOB="src/app/**/actions.ts" ./scripts/fanout-template.sh

set -e

PROMPT="${PROMPT:-}"
GLOB="${GLOB:-src/**/*.ts}"
TOOLS="${TOOLS:-Read,Edit}"
DRY_RUN="${DRY_RUN:-false}"

if [ -z "$PROMPT" ]; then
  echo "使い方: PROMPT=\"<指示>\" GLOB=\"<パターン>\" $0"
  echo ""
  echo "オプション:"
  echo "  TOOLS   使用ツール（デフォルト: Read,Edit）"
  echo "  DRY_RUN true にすると実行せずファイル一覧のみ表示"
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
FILES=$(eval "ls $REPO_ROOT/$GLOB 2>/dev/null" | sort)

if [ -z "$FILES" ]; then
  echo "対象ファイルが見つかりません: $GLOB"
  exit 1
fi

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "=== ファンアウト処理 ==="
echo "プロンプト: $PROMPT"
echo "対象: $FILE_COUNT ファイル ($GLOB)"
echo ""

if [ "$DRY_RUN" = "true" ]; then
  echo "$FILES"
  exit 0
fi

echo "最初の1ファイルでテストしてから全体を実行します。"
FIRST_FILE=$(echo "$FILES" | head -1)
echo "テスト対象: $FIRST_FILE"
echo ""
read -p "続行しますか？ [y/N] " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "キャンセルしました"
  exit 0
fi

# テスト実行
echo "--- テスト実行 ---"
claude -p "$PROMPT
対象ファイル: $FIRST_FILE" \
  --allowedTools "$TOOLS" \
  2>&1

echo ""
read -p "全ファイルに適用しますか？ [y/N] " confirm_all
if [ "$confirm_all" != "y" ] && [ "$confirm_all" != "Y" ]; then
  echo "テストのみで終了しました"
  exit 0
fi

# 全ファイルに適用
OK=0; FAIL=0
for file in $FILES; do
  [ "$file" = "$FIRST_FILE" ] && { OK=$((OK+1)); continue; }  # テスト済みはスキップ
  rel=$(realpath --relative-to="$REPO_ROOT" "$file")
  if claude -p "$PROMPT
対象ファイル: $file" --allowedTools "$TOOLS" 2>/dev/null | grep -q "FAIL"; then
    echo "❌ $rel"
    FAIL=$((FAIL+1))
  else
    echo "✓ $rel"
    OK=$((OK+1))
  fi
done

echo ""
echo "完了: OK=$OK / FAIL=$FAIL"
