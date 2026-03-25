# データフロー図（逆生成）

**分析日時**: 2026-03-25

---

## 基本データフロー

すべての操作は以下の単方向フローで実装されている。

```
ユーザーアクション
  → Server Action（バリデーション + DB 操作）
    → Supabase Admin Client
      → PostgreSQL
    → revalidatePath()
      → Next.js ISR キャッシュ無効化
        → Server Component 再レンダリング
          → UI 更新
```

---

## 画面別データフロー

### 1. プロジェクト一覧 (`/projects`)

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant SC as Server Component<br/>(projects/page.tsx)
    participant Q as queries.ts
    participant DB as Supabase DB

    U->>SC: /projects アクセス
    SC->>Q: listProjects()
    Q->>DB: SELECT * FROM projects ORDER BY created_at DESC
    DB-->>Q: Project[]
    Q-->>SC: Project[]
    SC-->>U: プロジェクト一覧表示

    U->>SC: プロジェクト作成フォーム送信
    SC->>SC: createProjectAction() [Server Action]
    SC->>Q: createProject(input)
    Q->>DB: INSERT INTO projects
    DB-->>Q: Project
    SC->>SC: revalidatePath('/projects')
    SC-->>U: 一覧更新
```

### 2. プロジェクト詳細 (`/projects/[id]`)

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant SC as Server Component<br/>(projects/[id]/page.tsx)
    participant CC as Client Component<br/>(TaskList.tsx)
    participant SA as Server Action<br/>(actions.ts)
    participant Q as queries.ts
    participant DB as Supabase DB

    U->>SC: /projects/[id] アクセス
    SC->>Q: getProject(id) + listTasksByProject(id) + listTaskNotesByProject(id)
    Q->>DB: 並列クエリ実行
    DB-->>SC: Project + Task[] + TaskNote[]
    SC->>CC: props として渡す
    CC-->>U: タスク一覧表示（ステータス別グループ）

    U->>CC: タグフィルター選択
    CC->>CC: selectedTag state 更新（クライアント側フィルター）
    CC-->>U: フィルター済みタスク表示

    U->>CC: ステータスボタンクリック
    CC->>SA: changeTaskStatusAction(taskId, currentStatus)
    SA->>Q: updateTaskStatus(taskId, nextStatus)
    Q->>DB: UPDATE tasks SET status = ?, completed_at = ?
    SA->>SA: revalidatePath('/projects/[id]')
    SA-->>U: UI 更新
```

### 3. Today ビュー (`/today`)

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant SC as Server Component<br/>(today/page.tsx)
    participant Q as queries.ts
    participant DB as Supabase DB

    U->>SC: /today アクセス
    SC->>Q: listTodayTasks(today) [並列]
    SC->>Q: listStalledTasks(3) [並列]
    Q->>DB: scheduled_for=today OR due_date=today AND status!=done
    Q->>DB: status='doing' AND updated_at < now()-3days
    DB-->>SC: TaskWithProject[] x2
    SC->>SC: 見積時間合計計算・過負荷判定
    SC-->>U: 今日のタスク + 滞留警告表示

    U->>SC: ステータスボタンクリック
    SC->>SC: changeTaskStatusAction() [Server Action]
    SC->>Q: updateTaskStatus()
    Q->>DB: UPDATE tasks
    SC->>SC: revalidatePath('/today')
    SC-->>U: UI 更新
```

### 4. History ビュー (`/history`)

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant SC as Server Component<br/>(history/page.tsx)
    participant Q as queries.ts
    participant DB as Supabase DB

    U->>SC: /history アクセス
    SC->>Q: listRecentCompleted(30)
    Q->>DB: SELECT tasks JOIN projects WHERE status='done' ORDER BY completed_at DESC LIMIT 30
    DB-->>Q: TaskWithProject[]
    Q-->>SC: TaskWithProject[]
    SC->>SC: completed_at 日付でグループ化
    SC-->>U: 日付別完了タスク履歴表示
```

---

## ステータス遷移フロー

```
todo ──クリック──► doing ──クリック──► done ──クリック──► todo
  ↑                                      │
  └──────────────────────────────────────┘
         (completed_at = null)    (completed_at = now())
```

### 実装詳細

```typescript
const NEXT_STATUS = {
  todo: "doing",
  doing: "done",
  done: "todo",
} as const;

// done 以外: completed_at = null
// done: completed_at = now()
```

---

## エラーハンドリングフロー

現状の実装では明示的なエラーハンドリング UI はなく、Server Action のエラーは Next.js のデフォルト動作に委ねられている。

```
Server Action 実行
  → 成功: revalidatePath() → UI 更新
  → 失敗: Next.js エラーバウンダリ（error.tsx 未実装）
```

---

## クライアント側状態管理

`TaskList.tsx` 内のローカル状態（グローバルストアなし）：

| 状態 | 型 | 用途 |
|---|---|---|
| `editing` | `string \| null` | 編集中のタスク ID |
| `showNotes` | `string \| null` | メモ表示中のタスク ID |
| `selectedTag` | `string \| null` | タグフィルター選択値 |
| `isPending` | `boolean` | `useTransition` のペンディング状態 |
