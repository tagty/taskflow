/**
 * taskflow 型定義集約（逆生成）
 * 分析日時: 2026-03-25
 * 実装根拠: src/lib/supabase/queries.ts
 */

// ======================
// エンティティ型
// ======================

export type TaskStatus = "todo" | "doing" | "done";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number | null;       // 1〜5、小さいほど高優先
  due_date: string | null;       // ISO date string (YYYY-MM-DD)
  estimate_minutes: number | null;
  scheduled_for: string | null;  // ISO date string (YYYY-MM-DD)
  completed_at: string | null;   // ISO timestamptz string
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type TaskNote = {
  id: string;
  task_id: string;
  body: string;
  created_at: string;
};

/** タスクにプロジェクト情報を JOIN した型（Today / History ビュー用） */
export type TaskWithProject = Task & {
  projects: Pick<Project, "name" | "color">;
};

// ======================
// 入力型（Server Actions）
// ======================

export type CreateProjectInput = {
  name: string;
  description?: string;
  color?: string;
};

export type CreateTaskInput = {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: number | null;        // 1〜5
  estimate_minutes?: number | null;
  scheduled_for?: string | null;
  tags?: string[];
};

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    | "title"
    | "description"
    | "due_date"
    | "priority"
    | "estimate_minutes"
    | "scheduled_for"
    | "tags"
  >
>;

export type CreateTaskNoteInput = {
  task_id: string;
  body: string;
};

// ======================
// ステータス遷移
// ======================

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

// ======================
// コンポーネント Props 型
// ======================

export type TaskStatusButtonProps = {
  status: TaskStatus;
  action: () => Promise<void>;
};

export type TaskListProps = {
  tasks: Task[];
  projectId: string;
  allTags: string[];
  notesByTaskId: Record<string, TaskNote[]>;
};

// ======================
// ユーティリティ型
// ======================

/** カラーパレット（プロジェクト作成時の選択肢） */
export type ProjectColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";
