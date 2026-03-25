# taskflow テストケース一覧（逆生成）

**分析日時**: 2026-03-25

未実装テストケースを優先度順に列挙。テストコードはそのまま追加できるよう実装可能な形式で記述。

---

## 高優先度

### TC-H01: TodayPage — 滞留タスク表示

**実装ファイル**: `src/app/today/page.test.tsx` に追加

```tsx
it("滞留タスクがある場合、警告セクションを表示する", async () => {
  vi.mocked(listTodayTasks).mockResolvedValue([]);
  vi.mocked(listStalledTasks).mockResolvedValue([
    baseTask({ id: "s1", title: "滞留タスク", status: "doing" }),
  ]);
  render(await TodayPage());
  expect(screen.getByText("滞留タスク")).toBeInTheDocument();
});

it("滞留タスクがない場合、警告セクションを表示しない", async () => {
  vi.mocked(listTodayTasks).mockResolvedValue([]);
  vi.mocked(listStalledTasks).mockResolvedValue([]);
  render(await TodayPage());
  // 滞留セクションの見出しが存在しない
  expect(screen.queryByText(/滞留/)).not.toBeInTheDocument();
});

it("滞留タスクにプロジェクト名を表示する", async () => {
  vi.mocked(listTodayTasks).mockResolvedValue([]);
  vi.mocked(listStalledTasks).mockResolvedValue([
    baseTask({
      id: "s1",
      title: "滞留タスク",
      status: "doing",
      projects: { name: "マイプロジェクト", color: null },
    }),
  ]);
  render(await TodayPage());
  expect(screen.getByText("マイプロジェクト")).toBeInTheDocument();
});
```

---

### TC-H02: TaskList — ステータス別グループ順序

**実装ファイル**: `src/app/projects/[id]/TaskList.test.tsx` に追加

```tsx
it("doing → todo → done の順でグループを表示する", () => {
  const tasks = [
    { ...baseTask, id: "t1", title: "未着手タスク", status: "todo" as const },
    { ...baseTask, id: "t2", title: "進行中タスク", status: "doing" as const },
    { ...baseTask, id: "t3", title: "完了タスク", status: "done" as const },
  ];
  render(<TaskList tasks={tasks} projectId="proj-1" allTags={[]} notesByTaskId={{}} />);

  const allText = document.body.textContent ?? "";
  expect(allText.indexOf("進行中タスク")).toBeLessThan(allText.indexOf("未着手タスク"));
  expect(allText.indexOf("未着手タスク")).toBeLessThan(allText.indexOf("完了タスク"));
});
```

---

### TC-H03: TaskList — タグフィルター「すべて」に戻る

**実装ファイル**: `src/app/projects/[id]/TaskList.test.tsx` に追加

```tsx
it("タグ選択後に「すべて」ボタンで全タスクを再表示する", async () => {
  const tasks = [
    baseTask,
    { ...baseTask, id: "task-2", title: "別タスク", tags: ["ci"] },
  ];
  render(<TaskList tasks={tasks} projectId="proj-1" allTags={["feature", "ci"]} notesByTaskId={{}} />);

  await userEvent.click(screen.getByRole("button", { name: "ci" }));
  expect(screen.queryByText("テストタスク")).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "すべて" }));
  expect(screen.getByText("テストタスク")).toBeInTheDocument();
  expect(screen.getByText("別タスク")).toBeInTheDocument();
});

it("選択中のタグを再クリックするとフィルターを解除する", async () => {
  const tasks = [
    baseTask,
    { ...baseTask, id: "task-2", title: "別タスク", tags: ["ci"] },
  ];
  render(<TaskList tasks={tasks} projectId="proj-1" allTags={["feature", "ci"]} notesByTaskId={{}} />);

  await userEvent.click(screen.getByRole("button", { name: "ci" }));
  await userEvent.click(screen.getByRole("button", { name: "ci" })); // 再クリック
  expect(screen.getByText("テストタスク")).toBeInTheDocument();
  expect(screen.getByText("別タスク")).toBeInTheDocument();
});
```

---

## 中優先度

### TC-M01: TaskList — タグなしタスク

**実装ファイル**: `src/app/projects/[id]/TaskList.test.tsx` に追加

```tsx
it("tags が空配列のタスクはすべてのフィルターで表示される", async () => {
  const noTagTask = { ...baseTask, id: "task-no-tag", title: "タグなしタスク", tags: [] };
  const taggedTask = { ...baseTask, id: "task-tagged", title: "タグありタスク", tags: ["feature"] };
  render(
    <TaskList
      tasks={[noTagTask, taggedTask]}
      projectId="proj-1"
      allTags={["feature"]}
      notesByTaskId={{}}
    />
  );

  // feature フィルターを選択
  await userEvent.click(screen.getByRole("button", { name: "feature" }));
  // タグなしタスクは feature タグを持たないので非表示
  expect(screen.queryByText("タグなしタスク")).not.toBeInTheDocument();
  expect(screen.getByText("タグありタスク")).toBeInTheDocument();
});
```

---

### TC-M02: History ページ — 日付グループ表示

**実装ファイル**: `src/app/history/page.test.tsx`（新規作成）

```tsx
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

  it("完了タスクがない場合、空状態を表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([]);
    render(await HistoryPage());
    expect(screen.queryByText("完了タスク")).not.toBeInTheDocument();
  });

  it("異なる日付の完了タスクを日付でグループ化して表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([
      completedTask({ id: "t1", title: "今日完了", completed_at: "2026-03-25T10:00:00Z" }),
      completedTask({ id: "t2", title: "昨日完了", completed_at: "2026-03-24T10:00:00Z" }),
    ]);
    render(await HistoryPage());
    expect(screen.getByText("今日完了")).toBeInTheDocument();
    expect(screen.getByText("昨日完了")).toBeInTheDocument();
    // 2026-03-25 の日付見出しが存在する
    expect(screen.getByText(/2026-03-25/)).toBeInTheDocument();
    expect(screen.getByText(/2026-03-24/)).toBeInTheDocument();
  });

  it("プロジェクト名を表示する", async () => {
    vi.mocked(listRecentCompleted).mockResolvedValue([
      completedTask({ projects: { name: "マイプロジェクト", color: null } }),
    ]);
    render(await HistoryPage());
    expect(screen.getByText("マイプロジェクト")).toBeInTheDocument();
  });
});
```

---

### TC-M03: GlobalNav — アクティブリンク

**実装ファイル**: `src/components/GlobalNav.test.tsx`（新規作成）

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlobalNav } from "./GlobalNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("GlobalNav", () => {
  it("Today リンクを表示する", () => {
    vi.mocked(usePathname).mockReturnValue("/today");
    render(<GlobalNav />);
    expect(screen.getByRole("link", { name: /Today/i })).toBeInTheDocument();
  });

  it("/today のとき Today リンクがボールド表示になる", () => {
    vi.mocked(usePathname).mockReturnValue("/today");
    render(<GlobalNav />);
    const link = screen.getByRole("link", { name: /Today/i });
    expect(link).toHaveClass("font-bold");
  });

  it("/projects のとき Projects リンクがボールド表示になる", () => {
    vi.mocked(usePathname).mockReturnValue("/projects");
    render(<GlobalNav />);
    const link = screen.getByRole("link", { name: /Projects/i });
    expect(link).toHaveClass("font-bold");
  });
});
```

---

## 低優先度

### TC-L01: Server Actions — バリデーション

**実装ファイル**: `src/app/projects/[id]/actions.test.ts`（新規作成・要 DB モック）

```
検証すべき項目（統合テスト or モックテストで実装）:
- priority=0 を渡した場合は無視される（1-5 範囲外）
- priority=6 を渡した場合は無視される
- estimate_minutes=-1 を渡した場合は無視される
- タグの重複が排除される（["a", "a", "b"] → ["a", "b"]）
- 空白のみのタグが排除される（[" ", "feature"] → ["feature"]）
```

### TC-L02: queries.ts — updateTaskStatus の completed_at 制御

```
検証すべき項目（Supabase をモックして実装）:
- status を "done" に変更すると completed_at = now() が設定される
- status を "todo" に変更すると completed_at = null にリセットされる
- status を "doing" に変更すると completed_at = null にリセットされる
```
