---
description: 依存関係のないタスクを git worktree で並列実行します。依存グラフをウェーブに分割し、各ウェーブ内のタスクを独立した worktree で同時実装します。
allowed-tools: Read, Glob, Grep, Task, Write, Edit, TodoWrite, AskUserQuestion, TaskList, TaskGet, TaskUpdate, Bash
argument-hint: "[要件名] [開始TASK-ID (TASK-00001)] [終了TASK-ID (TASK-00005)]"
---

- $1 がない場合、「引数に要件名・開始TASK-ID・終了TASK-IDを指定してください（例: /kairo-parallel ユーザー認証システム TASK-00001 TASK-00005）」と言って終了する
- $2 がない場合、「引数に開始TASK-IDを指定してください（例: TASK-00001）」と言って終了する
- $3 がない場合、「引数に終了TASK-IDを指定してください（例: TASK-00005）」と言って終了する

要件名=$1、開始TASK-ID=$2、終了TASK-ID=$3

# step

## step1: タスクファイルの読み込みと依存グラフ構築

- `docs/tasks/{要件名}/` 配下の TASK-$2 〜 TASK-$3 に対応するファイルを Read で読み込む
- 各タスクの `dependencies`（blockedBy）フィールドを抽出する
- 依存グラフをウェーブに分割する:
  - Wave 1: 依存タスクなし（または範囲外のタスクのみに依存）
  - Wave 2: Wave 1 のタスクのみに依存
  - Wave N: 前ウェーブのタスクのみに依存
- ウェーブ構成をユーザーに表示する:
  ```
  Wave 1: TASK-00001, TASK-00002（並列実行）
  Wave 2: TASK-00003（TASK-00001 完了後）
  Wave 3: TASK-00004, TASK-00005（TASK-00003 完了後）
  ```

step2 を実行する

## step2: ウェーブごとの並列実行

各ウェーブについて以下を繰り返す:

### ウェーブ内の並列起動

ウェーブ内のタスクを **同時に** Agent で起動する（isolation: "worktree" を必ず指定）:

```
各タスクに対して Agent tool を並列呼び出し:
  subagent_type: general-purpose
  isolation: "worktree"
  prompt: |
    以下のタスクを kairo-implement で実装してください。
    要件名: {要件名}
    TASK-ID: {TASK-ID}

    /tsumiki:kairo-implement {要件名} {TASK-ID} を実行してください。
    実装完了後、npm run verify を実行して確認してください。
```

### 完了待ち

- 全 Agent の完了を待つ
- 各 Agent が返した worktree パスとブランチ名を記録する
- エラーが発生したタスクがあれば報告し、ユーザーに続行確認する

step3 を実行する（次のウェーブへ）

## step3: 全ウェーブ完了後の報告

全ウェーブが完了したら:

- 作成されたブランチ一覧を表示する:
  ```
  完了したブランチ:
  - feature/{要件名}-TASK-00001（worktree: /path/to/worktree）
  - feature/{要件名}-TASK-00002（worktree: /path/to/worktree）
  ...
  ```
- 各ブランチの PR 作成を提案する
- `/tsumiki:auto-debug` を実行して全体の品質確認を行う

# rules

MUST: 各タスクは必ず `isolation: "worktree"` を指定した Agent で実行すること（ファイル競合防止）
MUST: 同一ウェーブ内の Agent は並列（同時）起動すること
MUST: 次のウェーブは前ウェーブの全 Agent 完了後に起動すること
NEVER: 依存関係のあるタスクを同じウェーブに入れないこと
