# scheduled_for 設定 UI

## 概要

タスク作成・編集フォームに `scheduled_for`（Today 画面に表示する日）の入力欄を追加する。

## ユーザーフロー

1. タスク作成フォームに「予定日」入力欄を追加
2. タスク編集フォームにも「予定日」入力欄を追加
3. 設定した日が Today 画面に表示される（既存の listTodayTasks のロジックをそのまま活用）

## 実装方針

### 変更するファイル

| ファイル | 変更内容 |
|---|---|
| `src/lib/supabase/queries.ts` | `createTask` / `updateTask` の引数に `scheduled_for` を追加 |
| `src/app/projects/[id]/actions.ts` | `createTaskAction` / `updateTaskAction` に `scheduled_for` フィールド追加 |
| `src/app/projects/[id]/page.tsx` | タスク作成フォームに予定日入力欄を追加 |
| `src/app/projects/[id]/TaskList.tsx` | タスク編集フォームに予定日入力欄を追加・タスクカードに予定日表示 |

## エッジケース

- 予定日は任意（未設定でも正常）
- due_date と scheduled_for は独立（両方設定可能）
- タスクカードに予定日を表示する（due_date と区別できるよう「予定:」ラベルを付ける）
