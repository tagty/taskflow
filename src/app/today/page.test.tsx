import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TodayPage from "./page";
import type { TaskWithProject } from "@/lib/supabase/queries";

vi.mock("@/lib/supabase/queries", () => ({
  listTodayTasks: vi.fn(),
  listStalledTasks: vi.fn(),
}));

vi.mock("./actions", () => ({
  changeTaskStatusAction: vi.fn(),
}));

import { listTodayTasks, listStalledTasks } from "@/lib/supabase/queries";

const baseTask = (overrides: Partial<TaskWithProject> = {}): TaskWithProject => ({
  id: "task-1",
  project_id: "proj-1",
  title: "テストタスク",
  description: null,
  status: "todo",
  priority: null,
  due_date: null,
  estimate_minutes: null,
  scheduled_for: null,
  completed_at: null,
  tags: [],
  created_at: "2026-03-13T00:00:00Z",
  updated_at: "2026-03-13T00:00:00Z",
  projects: { name: "テストプロジェクト", color: "#6b7280" },
  ...overrides,
});

describe("TodayPage", () => {
  it("タスクが0件の場合、合計を表示しない", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.queryByText(/合計/)).not.toBeInTheDocument();
  });

  it("estimate_minutes がすべて null の場合、合計を表示しない", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([baseTask({ estimate_minutes: null })]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.queryByText(/合計/)).not.toBeInTheDocument();
  });

  it("見積時間の合計を表示する（150分 → 2h30m）", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([
      baseTask({ id: "t1", estimate_minutes: 90 }),
      baseTask({ id: "t2", estimate_minutes: 60 }),
    ]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.getByText(/合計 2h30m/)).toBeInTheDocument();
  });

  it("合計が 480分以下の場合、過負荷警告を表示しない", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([baseTask({ estimate_minutes: 480 })]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.queryByText(/過負荷/)).not.toBeInTheDocument();
  });

  it("合計が 481分以上の場合、過負荷警告を表示する", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([baseTask({ estimate_minutes: 481 })]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.getByText(/過負荷/)).toBeInTheDocument();
  });

  it("estimate_minutes が部分的に null の場合、null を 0 扱いして合計する", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([
      baseTask({ id: "t1", estimate_minutes: 100 }),
      baseTask({ id: "t2", estimate_minutes: null }),
      baseTask({ id: "t3", estimate_minutes: 50 }),
    ]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.getByText(/合計 2h30m/)).toBeInTheDocument();
  });

  it("DB から返された順序でタスクを表示する（priority 昇順・null 末尾はDB側で保証）", async () => {
    // DB が priority 昇順・null 末尾でソート済みで返す想定
    vi.mocked(listTodayTasks).mockResolvedValue([
      baseTask({ id: "t1", title: "priority1タスク", priority: 1 }),
      baseTask({ id: "t2", title: "priority2タスク", priority: 2 }),
      baseTask({ id: "t3", title: "nullタスク", priority: null }),
    ]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    const items = screen.getAllByText(/タスク/);
    const titles = items.map((el) => el.textContent);
    expect(titles.indexOf("priority1タスク")).toBeLessThan(titles.indexOf("priority2タスク"));
    expect(titles.indexOf("priority2タスク")).toBeLessThan(titles.indexOf("nullタスク"));
  });

  it("タスクカードに P{n} バッジを表示する", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([baseTask({ priority: 3 })]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.getByText("P3")).toBeInTheDocument();
  });

  it("タスクカードに見積時間を表示する", async () => {
    vi.mocked(listTodayTasks).mockResolvedValue([baseTask({ estimate_minutes: 45 })]);
    vi.mocked(listStalledTasks).mockResolvedValue([]);
    render(await TodayPage());
    expect(screen.getByText("45m")).toBeInTheDocument();
  });
});
