# タスクの見積時間・優先度UI 技術設計書

**関連要件**: [requirements.md](../../spec/estimate-priority/requirements.md)

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `src/lib/supabase/queries.ts` | 修正 | `createTask` / `updateTask` に priority・estimate_minutes を追加 |
| `src/app/projects/[id]/actions.ts` | 修正 | `createTaskAction` / `updateTaskAction` に priority・estimate_minutes を追加 |
| `src/app/projects/[id]/page.tsx` | 修正 | 作成フォームに priority・estimate_minutes 入力欄を追加 |
| `src/app/projects/[id]/TaskList.tsx` | 修正 | カード表示・編集フォームに priority・estimate_minutes を追加 |
| `src/app/projects/[id]/TaskList.test.tsx` | 修正 | priority・estimate_minutes のテストを追加 |

## データフロー

```
[作成フォーム]
  input name="priority"         (number, 1-5, optional)
  input name="estimate_minutes" (number, optional)
        ↓ form action
[createTaskAction]
  priority = parseInt(formData.get("priority")) || undefined
  estimate_minutes = parseInt(formData.get("estimate_minutes")) || undefined
        ↓
[createTask in queries.ts]
  INSERT INTO tasks (..., priority, estimate_minutes)
        ↓
[revalidatePath → Server Component 再取得]
        ↓
[TaskItem]
  priority → 「P{n}」バッジで表示
  estimate_minutes → formatEstimate(n) で「1h30m」等に変換して表示
```

## 型定義変更

### queries.ts

```ts
// createTask input に追加
export async function createTask(input: {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  tags?: string[];
  priority?: number;          // 追加
  estimate_minutes?: number;  // 追加
}): Promise<Task>

// updateTask input に追加
export async function updateTask(
  taskId: string,
  input: {
    title: string;
    description: string | null;
    due_date: string | null;
    tags: string[];
    priority: number | null;          // 追加
    estimate_minutes: number | null;  // 追加
  }
): Promise<void>
```

## ユーティリティ関数

```ts
// TaskList.tsx 内に定義（単一ファイルで完結するため外部化しない）
function formatEstimate(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}
```

## UI設計

### タスクカード（表示時）

```
[○ todo] タスクタイトル                    [P2] [1h30m] [feature] [2026-03-10] [メモ] [編集]
         詳細説明テキスト
```

- priority が null の場合は非表示
- estimate_minutes が null の場合は非表示

### タスク作成フォーム（page.tsx）

```
[ タスクを追加... ] [ 日付 ] [ P: 1-5 ] [ 見積(分) ] [追加]
[ タグ（カンマ区切り）                                    ]
[ 詳細説明（任意）                                        ]
```

### タスク編集フォーム（TaskList.tsx）

既存フォームの due_date・tags 行に priority・estimate_minutes を追加：

```
[ 期日 ] [ タグ ] [ P: 1-5 ] [ 見積(分) ]
```
