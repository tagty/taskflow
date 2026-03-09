#!/bin/bash
# PR の差分を claude -p で自動レビューする
# 使い方: ./scripts/review-pr.sh [base_branch]

BASE=${1:-main}
DIFF=$(git diff "$BASE"...HEAD --stat)
FILES=$(git diff "$BASE"...HEAD --name-only | grep -E '\.(ts|tsx)$' | head -20)

if [ -z "$FILES" ]; then
  echo "レビュー対象の TypeScript ファイルがありません"
  exit 0
fi

echo "=== レビュー対象ファイル ==="
echo "$FILES"
echo ""

claude -p "以下の変更されたファイルをコードレビューしてください。
観点: バグ・エッジケース・Next.js パターン違反・セキュリティ・ダークモード対応漏れ
問題があれば「ファイル名:行番号 — 説明」の形式で列挙。問題なければ LGTM。

変更ファイル:
$FILES

差分サマリー:
$DIFF
" --allowedTools "Read,Grep,Glob"
