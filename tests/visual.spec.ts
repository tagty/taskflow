import { test, expect } from "@playwright/test";

test.describe("スクリーンショット比較", () => {
  test("プロジェクト一覧", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveScreenshot("projects.png", { fullPage: true });
  });

  test("Today画面", async ({ page }) => {
    await page.goto("/today");
    await expect(page).toHaveScreenshot("today.png", { fullPage: true });
  });

  test("完了履歴", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveScreenshot("history.png", { fullPage: true });
  });
});
