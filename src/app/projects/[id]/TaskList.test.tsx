import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskList } from "./TaskList";
import type { Task } from "@/lib/supabase/queries";

vi.mock("./actions", () => ({
  changeTaskStatusAction: vi.fn(),
  updateTaskAction: vi.fn().mockResolvedValue(undefined),
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
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} />);
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
  });

  it("タグバッジを表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={["feature", "ui"]} />);
    // フィルターボタンとバッジの両方に同じテキストが出るため getAllByText で確認
    expect(screen.getAllByText("feature").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("ui").length).toBeGreaterThanOrEqual(1);
  });

  it("期日を表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} />);
    expect(screen.getByText("期日: 2026-03-10")).toBeInTheDocument();
  });

  it("予定日を表示する", () => {
    const task = { ...baseTask, scheduled_for: "2026-03-09" };
    render(<TaskList tasks={[task]} projectId="proj-1" allTags={[]} />);
    expect(screen.getByText("予定: 2026-03-09")).toBeInTheDocument();
  });

  it("予定日が未設定の場合は表示しない", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} />);
    expect(screen.queryByText(/予定:/)).not.toBeInTheDocument();
  });

  it("タグフィルターボタンを表示する", () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={["feature", "ui"]} />);
    expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "feature" })).toBeInTheDocument();
  });

  it("タグフィルターで絞り込める", async () => {
    const tasks = [
      baseTask,
      { ...baseTask, id: "task-2", title: "別タスク", tags: ["ci"] },
    ];
    render(<TaskList tasks={tasks} projectId="proj-1" allTags={["feature", "ci"]} />);
    await userEvent.click(screen.getByRole("button", { name: "ci" }));
    expect(screen.queryByText("テストタスク")).not.toBeInTheDocument();
    expect(screen.getByText("別タスク")).toBeInTheDocument();
  });

  it("編集ボタンクリックで編集フォームを表示する", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} />);
    const editBtn = screen.getByRole("button", { name: "編集" });
    await userEvent.click(editBtn);
    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("キャンセルで編集フォームを閉じる", async () => {
    render(<TaskList tasks={[baseTask]} projectId="proj-1" allTags={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "編集" }));
    await userEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "保存" })).not.toBeInTheDocument();
  });
});
