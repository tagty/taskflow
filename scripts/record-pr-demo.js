const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PR_NUMBER = process.argv[2] || "14";
const PROJECT_ID = process.argv[3];
const OUT_DIR = path.join("screenshots", `pr-${PR_NUMBER}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  const projectUrl = PROJECT_ID
    ? `http://localhost:3000/projects/${PROJECT_ID}`
    : "http://localhost:3000/projects";

  // プロジェクト詳細ページへ移動
  await page.goto(projectUrl);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  // タスクカードにホバーしてメモボタンを表示
  const taskItem = page.locator("li").first();
  await taskItem.hover();
  await page.waitForTimeout(1000);

  // メモボタンをクリックして展開
  const memoBtn = page.locator("button[aria-label='メモ']").first();
  if (await memoBtn.isVisible()) {
    await memoBtn.click();
    await page.waitForTimeout(1000);

    // メモ入力フォームに入力
    const input = page.locator("input[name='body']").first();
    if (await input.isVisible()) {
      await input.fill("実装完了。テスト通過済み。");
      await page.waitForTimeout(800);
    }
  }

  await page.waitForTimeout(1500);

  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".webm"));
  if (files.length > 0) {
    console.log(path.join(OUT_DIR, files[files.length - 1]));
  }
})();
