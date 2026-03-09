#!/bin/bash
# 並列開発用の git worktree を作成する
# 使い方: ./scripts/new-worktree.sh <branch-name>
# 例: ./scripts/new-worktree.sh feature/tags

set -e

BRANCH=${1:-}
if [ -z "$BRANCH" ]; then
  echo "使い方: $0 <branch-name>"
  echo "例: $0 feature/tags"
  exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_DIR="${REPO_ROOT}/../taskflow-${BRANCH//\//-}"

echo "Worktree を作成: $WORKTREE_DIR (branch: $BRANCH)"
git worktree add -b "$BRANCH" "$WORKTREE_DIR" main

echo ""
echo "✓ 完了。別ターミナルで以下を実行:"
echo "  cd $WORKTREE_DIR"
echo "  npm install"
echo "  claude"
echo ""
echo "作業完了後の削除:"
echo "  git worktree remove $WORKTREE_DIR"
echo "  git branch -d $BRANCH"
