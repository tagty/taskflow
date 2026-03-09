# GitHub Workflow

## Issue フォーマット

```markdown
## Summary
このタスクの概要

## Goal
何を達成するか

## Tasks
- [ ] 実装内容1
- [ ] 実装内容2

## Acceptance Criteria
完了条件
```

## PR フォーマット

```markdown
## Summary
このPRでやったこと

## Changes
変更内容

## Testing
テスト方法

## Demo
![demo](https://tagty.github.io/taskflow/pr-{PR_NUMBER}/demo.gif)

## Screenshots
### 画面名
![](https://tagty.github.io/taskflow/pr-{PR_NUMBER}/screen.png)

## Related Issue
Closes #<number>
```

## ブランチ命名

```
feature/{issue-number}-{short-name}
例: feature/12-add-search
```
