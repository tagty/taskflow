#!/bin/bash
# Stop hook: セッション終了時に learnings.md へ自動記録する

cd /Users/tetsuyataguchi/ghq/github.com/tagty/taskflow

# git の変更がない場合はスキップ（作業なしセッション）
if git diff --quiet && git diff --cached --quiet && [ -z "$(git log --oneline --since='8 hours ago' 2>/dev/null)" ]; then
  exit 0
fi

# 今日の日付
TODAY=$(date +%Y-%m-%d)

# すでに今日のエントリがある場合はスキップ（重複防止）
if grep -q "^## ${TODAY}" .claude/learnings.md 2>/dev/null; then
  exit 0
fi

# git の情報を収集
GIT_LOG=$(git log --oneline --since='8 hours ago' 2>/dev/null | head -10)
GIT_DIFF_STAT=$(git diff --stat HEAD~1 HEAD 2>/dev/null | tail -5)

# claude -p で日記エントリを生成して追記
claude -p "
今日（${TODAY}）の開発セッションを振り返り、.claude/learnings.md に追記してください。

## セッション情報
直近のコミット:
${GIT_LOG}

変更サマリー:
${GIT_DIFF_STAT}

## 記録フォーマット
\`\`\`markdown
## ${TODAY}

### ✓ うまくいった
- （コミット内容や変更から推測される成功パターン）

### ✗ うまくいかなかった
- （特になければ「特になし」）

### → 次回の改善
- （次のセッションへの申し送り）
\`\`\`

.claude/learnings.md の末尾に追記してください。既存の内容は変更しないこと。
" --allowedTools "Read,Edit,Write" 2>/dev/null

echo "📔 diary-on-stop: learnings.md を更新しました"
