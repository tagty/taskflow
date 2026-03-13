import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "./TaskList";
import type { Task } from "@/lib/supabase/queries";

vi.mock("./actions", () => ({
  changeTaskStatusAction: vi.fn(),
  updateTaskAction: vi.fn().mockResolvedValue(undefined),
  deleteTaskAction: vi.fn().mockResolvedValue(undefined),
  createTaskNoteAction: vi.fn().mockResolvedValue(undefined),
}));

const baseTask: Task = {
  id: "task-1",
  project_id: "proj-1",
  title: "テストタスク",
  description: null,
  status: "todo",
  priority: null,
  due_date: "2026-03-10",
  estimate_minutes: null,
  scheduled_for: null,
  completed_at: null,
  tags: ["feature", "ui"],
  created_at: "2026-03-09T00:00:00Z",
  updated_at: "2026-03-09T00:00:00Z",
};

describe("TaskList", () => {
  it("タスクのタイトルを表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("タグバッジを表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={["feature", "ui"]} notesByTaskId={{}} />);
    // フィルターボタンとバッジの両方に同じテキストが出るため getAllByText で確認
    expect(screen.getAllByText("feature").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ui").length).toBeGreaterThanOrEqual(1);
  });

  it("期日を表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("2026-03-10")).toBeInTheDocument();
  });

  it("タグフィルターボタンを表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={["feature", "ui"]} notesByTaskId={{}} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "feature" })).toBeInTheDocument();
  });

  it("タグフィルターで絞り込める", async () => {
    const tasks = [
      baseTask,
      { ...baseTask, id: "task-2", title: "別タスク", tags: ["ci"] },
    ];
    render(<TaskList tasks={tasks} projectId="proj-1" allTags={["feature", "ci"]} notesByTaskId={{}} />);
    await userEvent.click(screen.getByRole("button", { name: "ci" }));
    expect(screen.queryByText("テストタスク")).not.toBeInTheDocument();
    expect(screen.getByText("別タスク")).toBeInTheDocument();
  });

  it("編集ボタンクリックで編集フォームを表示する", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    const editBtn = screen.getByRole("button", { name: "編集" });
    await userEvent.click(editBtn);
    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("編集フォームに削除ボタンを表示する", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    await userEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("キャンセルで編集フォームを閉じる", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    await userEvent.click(screen.getByRole("button", { name: "編集" }));
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });

  it("priority がある場合、P{n} バッジを表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, priority: 2 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("P2")).toBeInTheDocument();
  });

  it("priority が null の場合、バッジを表示しない", () => {
    render(<TaskList tasks={[{ ...baseTask, priority: null }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.queryByText(/^P\d/)).not.toBeInTheDocument();
  });

  it("estimate_minutes=90 の場合、1h30m と表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, estimate_minutes: 90 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("1h30m")).toBeInTheDocument();
  });

  it("estimate_minutes=60 の場合、1h と表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, estimate_minutes: 60 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("1h")).toBeInTheDocument();
  });

  it("estimate_minutes=30 の場合、30m と表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, estimate_minutes: 30 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("30m")).toBeInTheDocument();
  });

  it("estimate_minutes が null の場合、見積時間を表示しない", () => {
    render(<TaskList tasks={[{ ...baseTask, estimate_minutes: null }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.queryByText(/h|m$/)).not.toBeInTheDocument();
  });

  it("estimate_minutes=0 の場合、0m と表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, estimate_minutes: 0 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("0m")).toBeInTheDocument();
  });

  it("estimate_minutes=120 の場合、2h と表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, estimate_minutes: 120 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("2h")).toBeInTheDocument();
  });

  it("priority=1（最小値）を表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, priority: 1 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("P1")).toBeInTheDocument();
  });

  it("priority=5（最大値）を表示する", () => {
    render(<TaskList tasks={[{ ...baseTask, priority: 5 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.getByText("P5")).toBeInTheDocument();
  });

  it("編集フォームに priority・estimate_minutes の入力欄を表示する", async () => {
    render(<TaskList tasks={[{ ...baseTask, priority: 3, estimate_minutes: 45 }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    await userEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByTitle("優先度（1〜5）")).toHaveValue(3);
    expect(screen.getByTitle("見積時間（分）")).toHaveValue(45);
  });

  it("description が null の場合、詳細説明を表示しない", () => {
    render(<TaskList tasks={[{ ...baseTask, description: null }]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    expect(screen.queryByText(/詳細/)).not.toBeInTheDocument();
  });

  it("description がある場合、タイトル下部に表示する", () => {
    render(
      <TaskList
        tasks={[{ ...baseTask, description: "これは詳細説明です" }]}
        projectId="proj-1"
        allTags={[]}
        notesByTaskId={{}}
      />
    );
    expect(screen.getByText("これは詳細説明です")).toBeInTheDocument();
  });

  it("編集フォームに description textarea を表示する", async () => {
    render(
      <TaskList
        tasks={[{ ...baseTask, description: "既存の説明" }]}
        projectId="proj-1"
        allTags={[]}
        notesByTaskId={{}}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();
  });

  it("メモボタンをクリックするとメモセクションを表示する", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    const memoBtn = screen.getByRole("button", { name: "メモ" });
    await userEvent.click(memoBtn);
    expect(screen.getByPlaceholderText("メモを追加...")).toBeInTheDocument();
  });

  it("notesByTaskId にメモがある場合、メモ展開時に表示する", async () => {
    const notesByTaskId = {
      "task-1": [
        { id: "note-1", task_id: "task-1", body: "テストメモ内容", created_at: "2026-03-10T00:00:00Z" },
      ],
    };
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={notesByTaskId} />);
    // aria-label="メモ" のため件数に関わらずアクセシブル名は "メモ"
    const memoBtn = screen.getByRole("button", { name: "メモ" });
    expect(memoBtn).toHaveTextContent("メモ(1)");
    await userEvent.click(memoBtn);
    expect(screen.getByText("テストメモ内容")).toBeInTheDocument();
  });

  it("メモが0件の場合、メモボタンに件数を表示しない", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    const memoBtn = screen.getByRole("button", { name: "メモ" });
    expect(memoBtn).toHaveTextContent("メモ");
    expect(memoBtn).not.toHaveTextContent("メモ(");
  });

  it("メモボタンを再クリックするとメモセクションを閉じる", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);
    const memoBtn = screen.getByRole("button", { name: "メモ" });
    await userEvent.click(memoBtn);
    expect(screen.getByPlaceholderText("メモを追加...")).toBeInTheDocument();
    await userEvent.click(memoBtn);
    expect(screen.queryByPlaceholderText("メモを追加...")).not.toBeInTheDocument();
  });
});
