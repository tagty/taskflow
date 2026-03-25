import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlobalNav } from "./GlobalNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from "next/navigation";

describe("GlobalNav", () => {
  it("Today / Projects / History リンクを表示する", () => {
    vi.mocked(usePathname).mockReturnValue("/today");
    render(<GlobalNav />);
    expect(screen.getByRole("link", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "History" })).toBeInTheDocument();
  });

  it("/today のとき Today リンクがアクティブスタイルになる", () => {
    vi.mocked(usePathname).mockReturnValue("/today");
    render(<GlobalNav />);
    expect(screen.getByRole("link", { name: "Today" })).toHaveClass("font-medium");
    expect(screen.getByRole("link", { name: "Projects" })).not.toHaveClass("font-medium");
  });

  it("/projects のとき Projects リンクがアクティブスタイルになる", () => {
    vi.mocked(usePathname).mockReturnValue("/projects");
    render(<GlobalNav />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveClass("font-medium");
    expect(screen.getByRole("link", { name: "Today" })).not.toHaveClass("font-medium");
  });

  it("/projects/[id] のとき Projects リンクがアクティブスタイルになる", () => {
    vi.mocked(usePathname).mockReturnValue("/projects/some-id");
    render(<GlobalNav />);
    expect(screen.getByRole("link", { name: "Projects" })).toHaveClass("font-medium");
  });

  it("/history のとき History リンクがアクティブスタイルになる", () => {
    vi.mocked(usePathname).mockReturnValue("/history");
    render(<GlobalNav />);
    expect(screen.getByRole("link", { name: "History" })).toHaveClass("font-medium");
  });
});
