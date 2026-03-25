import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HistoryPage from "./page";
import type { TaskWithProject } from "@/lib/supabase/queries";

vi.mock("@/lib/supabase/queries", () => ({
  listRecentCompleted: vi.fn(),
}));

import { listRecentCompleted } from "@/lib/supabase/queries";

const completedTask = (overrides: Partial<TaskWithProject> = {}): TaskWithProject => ({
  id: "task-1",
  project_id: "proj-1",
  title: "完了タスク",
  description: null,
  status: "done",
  priority: null,
  due_date: null,
  estimate_minutes: null,
  scheduled_for: null,
  completed_at: "2026-03-25T10:00:00Z",
  tags: [],
  created_at: "2026-03-25T09:00:00Z",
  updated_at: "2026-03-25T10:00:00Z",
  projects: { name: "テストプロジェクト", color: null },
  ...overrides,
});

describe("HistoryPage", () => {
  it("完了タスクのタイトルを表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([completedTask()]);
    render(await HistoryPage());
    expect(screen.getByText("完了タスク")).toBeInTheDocument();
  });

  it("完了タスクがない場合、空状態メッセージを表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([]);
    render(await HistoryPage());
    expect(screen.getByText("完了したタスクはありません")).toBeInTheDocument();
  });

  it("完了日付の見出しを表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([
      completedTask({ completed_at: "2026-03-25T10:00:00Z" }),
    ]);
    render(await HistoryPage());
    expect(screen.getByText("2026-03-25")).toBeInTheDocument();
  });

  it("異なる日付のタスクを別グループで表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([
      completedTask({ id: "t1", title: "今日完了", completed_at: "2026-03-25T10:00:00Z" }),
      completedTask({ id: "t2", title: "昨日完了", completed_at: "2026-03-24T10:00:00Z" }),
    ]);
    render(await HistoryPage());
    expect(screen.getByText("今日完了")).toBeInTheDocument();
    expect(screen.getByText("昨日完了")).toBeInTheDocument();
    expect(screen.getByText("2026-03-25")).toBeInTheDocument();
    expect(screen.getByText("2026-03-24")).toBeInTheDocument();
  });

  it("プロジェクト名を表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([
      completedTask({ projects: { name: "マイプロジェクト", color: null } }),
    ]);
    render(await HistoryPage());
    expect(screen.getByText("マイプロジェクト")).toBeInTheDocument();
  });
});
