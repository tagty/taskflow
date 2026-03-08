import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskStatusButton } from "./TaskStatusButton";

describe("TaskStatusButton", () => {
  it("todo のラベルを表示する", () => {
    render(<TaskStatusButton status="todo" action={vi.fn()} />);
    expect(screen.getByText("未着手")).toBeInTheDocument();
  });

  it("doing のラベルを表示する", () => {
    render(<TaskStatusButton status="doing" action={vi.fn()} />);
    expect(screen.getByText("進行中")).toBeInTheDocument();
  });

  it("done のラベルを表示する", () => {
    render(<TaskStatusButton status="done" action={vi.fn()} />);
    expect(screen.getByText("完了")).toBeInTheDocument();
  });

  it("クリック時に action を呼び出す", async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    render(<TaskStatusButton status="todo" action={action} />);
    await userEvent.click(screen.getByText("未着手"));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
